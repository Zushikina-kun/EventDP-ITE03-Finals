"""
fine_tune_model.py — Retrain the gender classification model using MobileNetV2
transfer learning for significantly better accuracy.

Two-phase training:
  Phase 1 — Train only the new classification head (base frozen)
  Phase 2 — Unfreeze top layers of MobileNetV2 and fine-tune end-to-end

Dataset layout expected:
  train/
    female/
    male/
  validation/
    female/
    male/
"""

import os
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import (
    GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
)

# ==============================
# CONFIG
# ==============================

BATCH_SIZE    = 32
IMAGE_SIZE    = (160, 160)   # MobileNetV2 works well at 160×160
PHASE1_EPOCHS = 15           # head-only training
PHASE2_EPOCHS = 30           # fine-tuning (with early stopping)
UNFREEZE_FROM = 100          # unfreeze MobileNetV2 layers from this index onward

TRAIN_DIR = "train"
VAL_DIR   = "validation"
SAVE_DIR  = "saved_model"

os.makedirs(SAVE_DIR, exist_ok=True)

# Suppress verbose TF logs
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

# ==============================
# DATA PIPELINE  (tf.data — faster than ImageDataGenerator)
# ==============================

AUTOTUNE = tf.data.AUTOTUNE

def build_dataset(directory: str, training: bool):
    """Load images from a directory tree and apply augmentation if training.
    Returns (dataset, class_names_list).
    """
    raw_ds = tf.keras.utils.image_dataset_from_directory(
        directory,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        shuffle=training,
        seed=42,
    )
    # Capture class names before any transformations (attribute lives on raw dataset)
    names = raw_ds.class_names

    # Normalise to [0, 1]
    normalization = tf.keras.layers.Rescaling(1.0 / 255)

    if training:
        augmentation = tf.keras.Sequential([
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.12),
            tf.keras.layers.RandomZoom(0.15),
            tf.keras.layers.RandomTranslation(0.1, 0.1),
            tf.keras.layers.RandomBrightness(0.15),
            tf.keras.layers.RandomContrast(0.15),
        ])
        ds = raw_ds.map(
            lambda x, y: (augmentation(normalization(x), training=True), y),
            num_parallel_calls=AUTOTUNE,
        )
    else:
        ds = raw_ds.map(
            lambda x, y: (normalization(x), y),
            num_parallel_calls=AUTOTUNE,
        )

    return ds.cache().prefetch(AUTOTUNE), names


print("Loading datasets...")
train_ds, class_names = build_dataset(TRAIN_DIR, training=True)
val_ds, _             = build_dataset(VAL_DIR,   training=False)
num_classes = len(class_names)

print(f"\nClasses        : {class_names}")
print(f"Training batches  : {len(train_ds)}")
print(f"Validation batches: {len(val_ds)}\n")

# ==============================
# MODEL — MobileNetV2 transfer learning
# ==============================

base_model = MobileNetV2(
    input_shape=(*IMAGE_SIZE, 3),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False   # freeze for Phase 1

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(256, activation="relu")(x)
x = Dropout(0.4)(x)
x = Dense(64, activation="relu")(x)
x = Dropout(0.2)(x)
outputs = Dense(num_classes, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=outputs)
model.summary(line_length=90)

# ==============================
# PHASE 1 — Train classification head only
# ==============================

model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks_p1 = [
    EarlyStopping(
        monitor="val_loss", patience=5,
        restore_best_weights=True, verbose=1,
    ),
    ModelCheckpoint(
        filepath=os.path.join(SAVE_DIR, "best_checkpoint.keras"),
        monitor="val_accuracy", save_best_only=True, verbose=1,
    ),
]

print("\n=== Phase 1: Training classification head (base frozen) ===")
history1 = model.fit(
    train_ds,
    epochs=PHASE1_EPOCHS,
    validation_data=val_ds,
    callbacks=callbacks_p1,
)

# ==============================
# PHASE 2 — Unfreeze top layers and fine-tune
# ==============================

# Unfreeze the top portion of MobileNetV2
base_model.trainable = True
for layer in base_model.layers[:UNFREEZE_FROM]:
    layer.trainable = False

print(f"\nUnfroze {len(base_model.layers) - UNFREEZE_FROM} layers of MobileNetV2 for fine-tuning.")

model.compile(
    optimizer=Adam(learning_rate=1e-4),   # lower LR to avoid destroying pretrained weights
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks_p2 = [
    EarlyStopping(
        monitor="val_loss", patience=7,
        restore_best_weights=True, verbose=1,
    ),
    ReduceLROnPlateau(
        monitor="val_loss", factor=0.5,
        patience=3, min_lr=1e-7, verbose=1,
    ),
    ModelCheckpoint(
        filepath=os.path.join(SAVE_DIR, "best_checkpoint.keras"),
        monitor="val_accuracy", save_best_only=True, verbose=1,
    ),
]

print("\n=== Phase 2: Fine-tuning top MobileNetV2 layers ===")
history2 = model.fit(
    train_ds,
    epochs=PHASE2_EPOCHS,
    validation_data=val_ds,
    callbacks=callbacks_p2,
)

# ==============================
# SAVE FINAL MODEL & LABELS
# ==============================

model_path  = os.path.join(SAVE_DIR, "gender_classification_model.keras")
labels_path = os.path.join(SAVE_DIR, "class_names.json")

model.save(model_path)
print(f"\nModel saved  : {model_path}")

# Save {ClassName: index} mapping — capitalise to match existing classify.py convention
class_indices = {name.capitalize(): idx for idx, name in enumerate(class_names)}
with open(labels_path, "w") as f:
    json.dump(class_indices, f, indent=2)
print(f"Labels saved : {labels_path}  →  {class_indices}")

# ==============================
# FINAL EVALUATION
# ==============================

val_loss, val_acc = model.evaluate(val_ds, verbose=0)
print(f"\n{'='*50}")
print(f"Final Validation Accuracy : {val_acc * 100:.2f}%")
print(f"Final Validation Loss     : {val_loss:.4f}")
print(f"{'='*50}")
print("\nTraining complete. Run evaluate_model.py for true test-set accuracy.")

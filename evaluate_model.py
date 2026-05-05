"""
evaluate_model.py — Run this AFTER training to measure true model performance.

Directory layout expected:
  test/
    female/   ← held-out images the model has NEVER seen
    male/

  validation/
    female/   ← used during training for val_loss monitoring
    male/

This script evaluates against test/ (true accuracy).
The model already saw validation/ during training, so that number is optimistic.
"""

import os
import json
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

# ==============================
# CONFIG
# ==============================

MODEL_PATH  = "saved_model/gender_classification_model.keras"
LABELS_PATH = "saved_model/class_names.json"
TEST_DIR    = "test"
BATCH_SIZE  = 16

# ==============================
# LOAD MODEL
# ==============================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at '{MODEL_PATH}'. Run fine_tune_model.py first."
    )

print(f"Loading model: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Derive image size from model input shape
_input_shape = model.input_shape   # (None, H, W, C)
IMG_SIZE = (_input_shape[1], _input_shape[2])
print(f"Model input size: {IMG_SIZE}")

# ==============================
# LOAD CLASS LABELS
# ==============================

if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH, "r") as f:
        class_indices = json.load(f)
    # {ClassName: index} → sorted list by index
    class_labels = [k for k, v in sorted(class_indices.items(), key=lambda x: x[1])]
else:
    class_labels = ["Female", "Male"]

print(f"Classes: {class_labels}")

# ==============================
# TEST DATASET
# ==============================

if not os.path.exists(TEST_DIR):
    raise FileNotFoundError(
        f"Test directory '{TEST_DIR}' not found. "
        "Expected subfolders: test/female/ and test/male/"
    )

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    shuffle=False,
    seed=42,
)

# Normalise
normalization = tf.keras.layers.Rescaling(1.0 / 255)
test_ds = test_ds.map(
    lambda x, y: (normalization(x), y),
    num_parallel_calls=tf.data.AUTOTUNE,
).prefetch(tf.data.AUTOTUNE)

total_samples = sum(1 for _ in test_ds.unbatch())
print(f"Test samples: {total_samples}\n")

# ==============================
# EVALUATE
# ==============================

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

loss, accuracy = model.evaluate(test_ds, verbose=1)

print(f"\n{'='*40}")
print(f"Test Loss     : {loss:.4f}")
print(f"Test Accuracy : {accuracy * 100:.2f}%")
print(f"{'='*40}\n")

# ==============================
# PREDICTIONS
# ==============================

all_preds  = []
all_labels = []

for images, labels_batch in test_ds:
    preds = model.predict(images, verbose=0)
    all_preds.extend(np.argmax(preds, axis=1))
    all_labels.extend(np.argmax(labels_batch.numpy(), axis=1))

y_pred = np.array(all_preds)
y_true = np.array(all_labels)

# ==============================
# CONFUSION MATRIX
# ==============================

cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
header = f"{'':>12}" + "".join(f"{l:>12}" for l in class_labels)
print(header)
for i, row in enumerate(cm):
    print(f"{class_labels[i]:>12}" + "".join(f"{v:>12}" for v in row))

# ==============================
# CLASSIFICATION REPORT
# ==============================

report = classification_report(y_true, y_pred, target_names=class_labels)
print(f"\nClassification Report:\n{report}")

# ==============================
# PER-CLASS ACCURACY
# ==============================

print("Per-class Accuracy:")
for i, label in enumerate(class_labels):
    correct = cm[i][i]
    total   = cm[i].sum()
    pct     = correct / total * 100 if total > 0 else 0
    print(f"  {label:<10}: {correct}/{total} = {pct:.1f}%")

"""
prepare_selfies.py — Preprocess selfie photos for model fine-tuning.

HOW TO USE
──────────
1. Create a folder structure like this:

   selfies/
     male/
       brix/        ← put your selfie photos here (JPG/PNG)
       cyrille/
       djaunathan/
       jan_alexis/
       jibreel/
       roldan/
     female/        ← leave empty or add female photos if you have any

2. Run this script:
   python prepare_selfies.py

3. It will output processed images to:
   selfies_processed/
     male/
     female/

4. Then copy those into your existing train/ folder:
   - selfies_processed/male/*  →  train/male/
   - selfies_processed/female/* → train/female/

5. Retrain:
   python fine_tune_model.py

WHAT THIS SCRIPT DOES
─────────────────────
For each selfie image:
  1. Detects faces using OpenCV Haar Cascade (fast, no GPU needed)
  2. Crops to the detected face with a small margin
  3. Resizes to 160×160 (matches MobileNetV2 input)
  4. Applies CLAHE (Contrast Limited Adaptive Histogram Equalization)
     to normalize lighting differences between phone cameras
  5. Saves as high-quality JPEG

If no face is detected, the image is skipped and reported.

TIPS FOR BETTER RESULTS
────────────────────────
- Take at least 30–50 photos per person
- Vary: lighting (indoor/outdoor/lamp), angle (straight, slight left/right tilt),
  distance (close, medium), expression (neutral, slight smile)
- Avoid: sunglasses, hats, heavy shadows on face, blurry photos
- Good lighting is the single most important factor
"""

import os
import cv2
import numpy as np
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────

INPUT_DIR  = "selfies"           # your raw selfie folders go here
OUTPUT_DIR = "selfies_processed" # processed output
IMG_SIZE   = (160, 160)          # must match model input
FACE_MARGIN = 0.25               # extra margin around detected face (25%)
JPEG_QUALITY = 95

# ── FACE DETECTOR ─────────────────────────────────────────────────────────────

# OpenCV's built-in frontal face detector — no download needed
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

if face_cascade.empty():
    raise RuntimeError(f"Could not load Haar cascade from: {CASCADE_PATH}")

print(f"[✓] Face detector loaded: haarcascade_frontalface_default.xml")

# ── CLAHE for lighting normalization ──────────────────────────────────────────
# CLAHE (Contrast Limited Adaptive Histogram Equalization) normalizes local
# contrast — helps when photos are taken in different lighting conditions
# (bright outdoor vs dim indoor vs phone flash)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))


def process_image(img_path: Path) -> np.ndarray | None:
    """
    Load an image, detect the face, crop + normalize, resize to 160×160.
    Returns the processed image array (BGR) or None if no face found.
    """
    img = cv2.imread(str(img_path))
    if img is None:
        print(f"  [!] Could not read: {img_path.name}")
        return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect faces — try with default params first, then more lenient
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    if len(faces) == 0:
        # Try more lenient detection (useful for angled/partially lit faces)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(40, 40))

    if len(faces) == 0:
        return None

    # Use the largest detected face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    # Add margin around the face
    margin_x = int(w * FACE_MARGIN)
    margin_y = int(h * FACE_MARGIN)
    x1 = max(0, x - margin_x)
    y1 = max(0, y - margin_y)
    x2 = min(img.shape[1], x + w + margin_x)
    y2 = min(img.shape[0], y + h + margin_y)

    face_crop = img[y1:y2, x1:x2]

    # Apply CLAHE to each channel (normalize lighting)
    lab = cv2.cvtColor(face_crop, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_eq = clahe.apply(l)
    lab_eq = cv2.merge([l_eq, a, b])
    face_normalized = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2BGR)

    # Resize to model input size
    face_resized = cv2.resize(face_normalized, IMG_SIZE, interpolation=cv2.INTER_LANCZOS4)

    return face_resized


# ── MAIN PROCESSING LOOP ──────────────────────────────────────────────────────

SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".heic"}

total_processed = 0
total_skipped   = 0
stats = {}

input_path  = Path(INPUT_DIR)
output_path = Path(OUTPUT_DIR)

if not input_path.exists():
    print(f"\n[!] Input folder '{INPUT_DIR}' not found.")
    print(f"    Create it with subfolders: {INPUT_DIR}/male/ and {INPUT_DIR}/female/")
    print(f"    Then put your selfie photos inside.\n")
    exit(1)

print(f"\nScanning '{INPUT_DIR}' for images...\n")

for gender_dir in sorted(input_path.iterdir()):
    if not gender_dir.is_dir():
        continue

    gender = gender_dir.name.lower()  # "male" or "female"
    out_gender_dir = output_path / gender
    out_gender_dir.mkdir(parents=True, exist_ok=True)

    gender_processed = 0
    gender_skipped   = 0

    # Walk all subfolders (one per person is fine)
    image_files = []
    for ext in SUPPORTED:
        image_files.extend(gender_dir.rglob(f"*{ext}"))
        image_files.extend(gender_dir.rglob(f"*{ext.upper()}"))

    if not image_files:
        print(f"  [{gender}/] No images found — skipping")
        continue

    print(f"  [{gender}/] Found {len(image_files)} images")

    for img_path in sorted(image_files):
        result = process_image(img_path)

        if result is None:
            print(f"    [SKIP] No face detected: {img_path.name}")
            gender_skipped += 1
            total_skipped  += 1
            continue

        # Generate unique output filename
        # Use parent folder name (person name) + original filename
        person = img_path.parent.name if img_path.parent != gender_dir else "selfie"
        out_name = f"{person}_{img_path.stem}.jpg"
        out_path = out_gender_dir / out_name

        # Avoid overwriting
        counter = 1
        while out_path.exists():
            out_path = out_gender_dir / f"{person}_{img_path.stem}_{counter}.jpg"
            counter += 1

        cv2.imwrite(str(out_path), result, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        gender_processed += 1
        total_processed  += 1

    stats[gender] = {"processed": gender_processed, "skipped": gender_skipped}
    print(f"    → Processed: {gender_processed}  |  Skipped (no face): {gender_skipped}")

# ── SUMMARY ───────────────────────────────────────────────────────────────────

print(f"\n{'='*50}")
print(f"DONE")
print(f"{'='*50}")
print(f"Total processed : {total_processed}")
print(f"Total skipped   : {total_skipped}")
print(f"\nOutput saved to: {OUTPUT_DIR}/")
for gender, s in stats.items():
    print(f"  {gender}/  →  {s['processed']} images ready")

if total_processed > 0:
    print(f"""
NEXT STEPS
──────────
1. Review the processed images in '{OUTPUT_DIR}/'
   Delete any that look wrong (bad crop, wrong person, etc.)

2. Copy them into your training folder:
   {OUTPUT_DIR}/male/   →  train/male/
   {OUTPUT_DIR}/female/ →  train/female/

   On Windows (PowerShell):
   Copy-Item "{OUTPUT_DIR}\\male\\*" "train\\male\\"
   Copy-Item "{OUTPUT_DIR}\\female\\*" "train\\female\\"

3. Retrain the model:
   python fine_tune_model.py

NOTE: For meaningful improvement, aim for 50+ photos per person
with varied lighting and angles. The more diverse the better.
""")

if total_skipped > 0:
    print(f"""
TIPS FOR SKIPPED IMAGES
────────────────────────
{total_skipped} image(s) had no face detected. Try:
- Make sure your face is clearly visible and well-lit
- Face the camera directly (frontal view works best)
- Avoid extreme angles, sunglasses, or heavy shadows
- Move closer to the camera
- Take the photo in good lighting (natural light is best)
""")

"""
ml-server.py — FastAPI server for gender classification.

Endpoints:
  GET  /          — health check
  GET  /health    — detailed health (model info, classes)
  POST /predict   — upload an image, returns label + confidence (primary)
  POST /upload    — alias for /predict
"""

import os
import uuid
import glob

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from classify import classify_image, labels, IMG_SIZE

app = FastAPI(title="Gender Classification API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Clean up any stale uploads left over from a previous crash
for stale in glob.glob(os.path.join(UPLOAD_DIR, "*")):
    try:
        os.remove(stale)
    except OSError:
        pass

ALLOWED_EXTENSIONS  = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE_MB    = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@app.get("/")
def root():
    return {"message": "Gender Classification API is running", "version": "2.0.0"}


@app.get("/health")
def health():
    """Detailed health check — confirms model is loaded and returns metadata."""
    return {
        "status":     "ok",
        "model":      "gender_classification_model.keras",
        "input_size": list(IMG_SIZE),
        "classes":    labels,
    }


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload a face image and receive a gender prediction with confidence."""
    return await _classify_file(file)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Alias for /upload — satisfies the POST /predict requirement."""
    return await _classify_file(file)


async def _classify_file(file: UploadFile):

    # Validate file extension
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{file_ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # Read and size-check before writing to disk
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB.",
        )

    file_name = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    try:
        with open(file_path, "wb") as buf:
            buf.write(contents)

        result = classify_image(file_path)

        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

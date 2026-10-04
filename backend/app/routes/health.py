from fastapi import APIRouter, UploadFile, File
import cv2
import numpy as np

from app.services.face_detector import detect_face

router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


@router.get("/test")
def test_health():
    return {
        "heart_rate": 78,
        "respiratory_rate": 16,
        "signal_quality": "Good",
        "status": "Normal"
    }


@router.post("/detect-face")
async def detect_face_api(file: UploadFile = File(...)):

    contents = await file.read()

    image_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "success": False,
            "message": "Invalid image"
        }

    faces = detect_face(frame)

    return {
        "success": True,
        "face_detected": len(faces) > 0,
        "face_count": len(faces)
    }
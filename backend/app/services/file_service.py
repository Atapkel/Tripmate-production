import uuid
from pathlib import Path

from fastapi import UploadFile

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_image_type(content_type: str) -> None:
    """Raise ValueError if the content type is not an allowed image type."""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            f"File type not allowed. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )


async def save_upload(file: UploadFile, directory: str) -> Path:
    """Save an uploaded file to the given directory with a unique name.

    Returns the path to the saved file.
    Raises ValueError if the file exceeds MAX_PHOTO_SIZE.
    """
    upload_dir = Path(directory)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    file_size = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                file_size += len(chunk)
                if file_size > MAX_PHOTO_SIZE:
                    buffer.close()
                    file_path.unlink()
                    raise ValueError("File size exceeds 5MB limit")
                buffer.write(chunk)
    except ValueError:
        raise
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise OSError(f"Failed to upload file: {e}")

    return file_path


def delete_file(path: str | None) -> None:
    """Delete a file if it exists."""
    if path:
        Path(path).unlink(missing_ok=True)

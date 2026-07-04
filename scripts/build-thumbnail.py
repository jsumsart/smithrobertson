from pathlib import Path
import sys

from PIL import Image, ImageOps


MAX_SIZE = 640
JPEG_QUALITY = 68


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-thumbnail.py <source> <output>")

    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        elif image.mode == "L":
            image = image.convert("RGB")

        image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
        image.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

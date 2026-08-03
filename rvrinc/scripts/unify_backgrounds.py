"""
Removes each team member's background and composites them onto Tanya's background.
Saves results as new files alongside the originals (same name, _unified suffix).
Run: python scripts/unify_backgrounds.py
"""

from pathlib import Path
from PIL import Image
import rembg
import io

PUBLIC = Path(__file__).parent.parent / "public" / "images"
TEMPLATE = PUBLIC / "Pretoria" / "Tanya.jpg"

PHOTOS = {
    "Pretoria": [
        "Karmi.jpg", "Karyn.jpg", "Roxanne.jpg", "Sara.jpg",
        "Werner.jpg", "Nieuwoudt.jpg", "George.jpg", "Lizzy.jpg", "Minah.jpg",
    ],
    "Marble Hall": [
        "Martie.jpg", "Alwyn.jpg", "Joel.jpg",
        "Lineque.jpg", "Olgah.jpg", "Yolande.jpg",
    ],
}

def remove_bg(img: Image.Image) -> Image.Image:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    result_bytes = rembg.remove(buf.getvalue())
    return Image.open(io.BytesIO(result_bytes)).convert("RGBA")

def composite_onto_background(bg: Image.Image, person_rgba: Image.Image) -> Image.Image:
    bg = bg.copy().convert("RGBA")
    # Scale person to fill the background height, keeping aspect ratio
    scale = bg.height / person_rgba.height
    new_w = int(person_rgba.width * scale)
    new_h = bg.height
    person_scaled = person_rgba.resize((new_w, new_h), Image.LANCZOS)
    # Centre horizontally
    x = (bg.width - new_w) // 2
    bg.paste(person_scaled, (x, 0), person_scaled)
    return bg.convert("RGB")

def main():
    bg_template = Image.open(TEMPLATE).convert("RGB")
    print(f"Template: {TEMPLATE} ({bg_template.size})")

    for folder, filenames in PHOTOS.items():
        for filename in filenames:
            src = PUBLIC / folder / filename
            if not src.exists():
                print(f"  SKIP (not found): {src}")
                continue

            # Destination: overwrite original (keep backup alongside)
            dst = src
            backup = src.with_stem(src.stem + "_original")
            if not backup.exists():
                import shutil
                shutil.copy2(src, backup)

            print(f"  Processing {folder}/{filename} ...", end=" ", flush=True)
            original = Image.open(src).convert("RGB")
            person_rgba = remove_bg(original)
            result = composite_onto_background(bg_template, person_rgba)
            result.save(dst, quality=92)
            print("done")

    print("\nAll done. Original files backed up with _original suffix.")

if __name__ == "__main__":
    main()

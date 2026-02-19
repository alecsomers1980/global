import os
from PIL import Image

def resize_images(directory, max_width=800):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(root, file)
                try:
                    with Image.open(filepath) as img:
                        # Calculate new size
                        width, height = img.size
                        if width > max_width:
                            ratio = max_width / width
                            new_height = int(height * ratio)
                            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                            
                            # Save back to the same path
                            img.save(filepath, optimization=True, quality=85)
                            print(f"Resized: {file} ({width}x{height} -> {max_width}x{new_height})")
                        else:
                            print(f"Skipped (already small): {file}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    base_dir = os.path.join(os.getcwd(), "public", "images")
    resize_images(base_dir) # Process root images folder (Ptagroup, Mhgroup, etc.)
    resize_images(os.path.join(base_dir, "Pretoria"))
    resize_images(os.path.join(base_dir, "Marble Hall"))

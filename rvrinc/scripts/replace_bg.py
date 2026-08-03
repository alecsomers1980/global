import os
from PIL import Image, ImageOps
from rembg import remove

background_path = r"C:\Users\info\.gemini\antigravity-ide\brain\26b1cb9f-42cd-4d9a-8e8d-bb7fb8cd99cc\media__1781701761648.jpg"
base_dir = r"c:\Users\info\OneDrive\Documents\Antigravity\rvrinc\public"

images = [
    "/images/Pretoria/Tanya.jpg",
    "/images/Pretoria/Karmi.jpg",
    "/images/Pretoria/Werner.jpg",
    "/images/Pretoria/Nieuwoudt.jpg",
    "/images/Pretoria/Karyn.jpg",
    "/images/Pretoria/Roxanne.jpg",
    "/images/Pretoria/Sara.jpg",
    "/images/Pretoria/Lizzy.jpg",
    "/images/Pretoria/Minah.jpg",
    "/images/Pretoria/George.jpg",
    "/images/Marble Hall/Alwyn.jpg",
    "/images/Marble Hall/Martie.jpg",
    "/images/Marble Hall/Yolande.jpg",
    "/images/Marble Hall/Lineque.jpg",
    "/images/Marble Hall/Olgah.jpg",
    "/images/Marble Hall/Joel.jpg",
    # Add team photos
    "/images/Ptagroup.png",
    "/images/Marble Hall/Mhgroup.jpg"
]

def process_images():
    print("Loading background...")
    try:
        bg_image = Image.open(background_path).convert("RGBA")
    except Exception as e:
        print(f"Error loading background: {e}")
        return

    for img_path in images:
        full_path = os.path.normpath(base_dir + img_path)
        
        # Determine source file
        dir_name = os.path.dirname(full_path)
        base_name = os.path.basename(full_path)
        name, ext = os.path.splitext(base_name)
        
        original_path = os.path.join(dir_name, f"{name}_original{ext}")
        source_path = original_path if os.path.exists(original_path) else full_path
        
        if not os.path.exists(source_path):
            print(f"File not found: {source_path}")
            continue
            
        # Create a backup if we are using the current file as source and original doesn't exist
        if source_path == full_path and not os.path.exists(original_path):
            try:
                import shutil
                shutil.copy2(full_path, original_path)
                print(f"Created backup: {original_path}")
            except Exception as e:
                print(f"Failed to backup {full_path}: {e}")
        
        print(f"Processing: {base_name}")
        try:
            with open(source_path, 'rb') as f:
                input_data = f.read()
            
            output_data = remove(input_data)
            
            from io import BytesIO
            fg_image = Image.open(BytesIO(output_data)).convert("RGBA")
            
            # Fix distortion by cropping and resizing proportionally instead of stretching
            bg_resized = ImageOps.fit(bg_image, fg_image.size, method=Image.LANCZOS, centering=(0.5, 0.5))
            
            # Composite
            composite = Image.alpha_composite(bg_resized, fg_image)
            
            # Convert back to RGB and save, maintaining png or jpeg
            save_format = "PNG" if ext.lower() == ".png" else "JPEG"
            if save_format == "JPEG":
                final_image = composite.convert("RGB")
                final_image.save(full_path, format=save_format, quality=90)
            else:
                composite.save(full_path, format=save_format)
            print(f"Successfully saved {full_path}")
        except Exception as e:
            print(f"Error processing {base_name}: {e}")

if __name__ == '__main__':
    process_images()

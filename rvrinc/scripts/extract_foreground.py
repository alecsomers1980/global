import os
from rembg import remove
from PIL import Image
from io import BytesIO

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
    "/images/Ptagroup.png",
    "/images/Marble Hall/Mhgroup.jpg"
]

def process_images():
    for img_path in images:
        full_path = os.path.normpath(base_dir + img_path)
        
        dir_name = os.path.dirname(full_path)
        base_name = os.path.basename(full_path)
        name, ext = os.path.splitext(base_name)
        
        original_path = os.path.join(dir_name, f"{name}_original{ext}")
        source_path = original_path if os.path.exists(original_path) else full_path
        
        if not os.path.exists(source_path):
            print(f"File not found: {source_path}")
            continue
            
        print(f"Processing: {base_name}")
        try:
            with open(source_path, 'rb') as f:
                input_data = f.read()
            
            # Use alpha_matting for smoother edges (fixes "jagged" look)
            output_data = remove(input_data, alpha_matting=True)
            
            fg_image = Image.open(BytesIO(output_data)).convert("RGBA")
            
            # Save as PNG
            png_path = os.path.join(dir_name, f"{name}.png")
            fg_image.save(png_path, format="PNG")
            print(f"Successfully saved transparent PNG: {png_path}")
            
            # If the original was a .jpg and we saved a .png, we can delete the old .jpg
            # (but ONLY if it's not the original backup!)
            if ext.lower() in ['.jpg', '.jpeg'] and full_path != original_path:
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"Could not remove old jpg: {e}")
                    
        except Exception as e:
            print(f"Error processing {base_name}: {e}")

if __name__ == '__main__':
    process_images()

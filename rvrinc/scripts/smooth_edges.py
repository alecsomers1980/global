import os
from PIL import Image, ImageFilter

base_dir = r"c:\Users\info\OneDrive\Documents\Antigravity\rvrinc\public"

images = [
    "/images/Pretoria/Tanya.png",
    "/images/Pretoria/Karmi.png",
    "/images/Pretoria/Werner.png",
    "/images/Pretoria/Nieuwoudt.png",
    "/images/Pretoria/Karyn.png",
    "/images/Pretoria/Roxanne.png",
    "/images/Pretoria/Sara.png",
    "/images/Pretoria/Lizzy.png",
    "/images/Pretoria/Minah.png",
    "/images/Pretoria/George.png",
    "/images/Marble Hall/Alwyn.png",
    "/images/Marble Hall/Martie.png",
    "/images/Marble Hall/Yolande.png",
    "/images/Marble Hall/Lineque.png",
    "/images/Marble Hall/Olgah.png",
    "/images/Marble Hall/Joel.png",
    "/images/Ptagroup.png",
    "/images/Marble Hall/Mhgroup.png"
]

def smooth_edges():
    for img_path in images:
        full_path = os.path.normpath(base_dir + img_path)
        
        if not os.path.exists(full_path):
            print(f"File not found: {full_path}")
            continue
            
        print(f"Smoothing: {img_path}")
        try:
            img = Image.open(full_path).convert("RGBA")
            
            # Extract alpha channel
            r, g, b, a = img.split()
            
            # Apply a slight blur to the alpha channel to anti-alias the jagged edges
            a_blurred = a.filter(ImageFilter.GaussianBlur(1.5))
            
            # Merge back
            smoothed_img = Image.merge("RGBA", (r, g, b, a_blurred))
            
            smoothed_img.save(full_path, "PNG")
            print(f"Successfully smoothed {img_path}")
            
        except Exception as e:
            print(f"Error processing {img_path}: {e}")

if __name__ == '__main__':
    smooth_edges()

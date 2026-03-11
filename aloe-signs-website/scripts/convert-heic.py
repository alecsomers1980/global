import os
from PIL import Image
import pillow_heif

# Register HEIF opener with PIL
pillow_heif.register_heif_opener()

try:
    print("Opening HEIC file...")
    image = Image.open('public/images/Billboards.heic')
    print("Converting and saving as JPEG...")
    # Convert to RGB if necessary (HEIC might have alpha or other modes)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image.save('public/images/Billboards.jpeg', format='JPEG', quality=90)
    print("Successfully converted Billboards.heic to Billboards.jpeg!")
except Exception as e:
    print(f"Error during conversion: {e}")

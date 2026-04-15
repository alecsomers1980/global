import fitz # PyMuPDF
import glob
import os

pdf_files = glob.glob(r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\*.pdf')

for file_path in pdf_files:
    print(f"--- Extracting {file_path} ---")
    doc = fitz.open(file_path)
    
    # Extract Text
    text = ""
    for page in doc:
        text += page.get_text()
        
    out_txt = file_path.replace('.pdf', '_extracted.txt')
    with open(out_txt, 'w', encoding='utf-8') as f:
        f.write(text)
    
    # Extract Images
    for i, page in enumerate(doc):
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_name = f"{file_path.replace('.pdf', '')}_img_p{i+1}_{image_index}.{image_ext}"
            with open(image_name, "wb") as image_file:
                image_file.write(image_bytes)
    print(f"Extracted {len(doc)} pages of text and images for {os.path.basename(file_path)}.")

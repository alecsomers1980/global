import fitz  # PyMuPDF
import os

# Only extract these 4 new PDFs
pdfs = [
    r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\19 March 2026.pdf',
    r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\27 March 2026.pdf',
    r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\16 April 2026.pdf',
    r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\23 April 2026.pdf',
]

base_out = r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter'

for file_path in pdfs:
    basename = os.path.splitext(os.path.basename(file_path))[0]
    # Create output directory for images
    out_dir = os.path.join(base_out, basename)
    os.makedirs(out_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"Processing: {basename}")
    print(f"{'='*60}")
    
    doc = fitz.open(file_path)
    
    # Extract Text
    text = ""
    for page in doc:
        text += f"\n--- PAGE {page.number + 1} ---\n"
        text += page.get_text()
    
    out_txt = os.path.join(out_dir, f"{basename}_extracted.txt")
    with open(out_txt, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Text saved to: {out_txt}")
    
    # Extract Images
    img_count = 0
    for i, page in enumerate(doc):
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_name = os.path.join(out_dir, f"img_p{i+1}_{image_index}.{image_ext}")
                with open(image_name, "wb") as image_file:
                    image_file.write(image_bytes)
                img_count += 1
            except Exception as e:
                print(f"  Warning: Could not extract image p{i+1}_{image_index}: {e}")
    
    print(f"Extracted {len(doc)} pages, {img_count} images")
    doc.close()

print("\n\nDone! All PDFs processed.")

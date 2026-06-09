import fitz
import sys

pdf_path = sys.argv[1]
doc = fitz.open(pdf_path)
for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    pix = page.get_pixmap()
    output = f"page_{page_num}.png"
    pix.save(output)
    print(f"Saved {output}")

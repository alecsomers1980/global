import sys
import glob

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Please pip install PyPDF2.")
    sys.exit(1)

pdf_files = glob.glob(r'c:\Users\info\OneDrive\Documents\Antigravity\riverview-prep-website\public\Newsletter\*.pdf')

for file_path in pdf_files:
    print(f"--- Extracting {file_path} ---")
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\\n--- PAGE {i+1} ---\\n"
                    text += page_text
            
            # Save to a text file
            out_path = file_path.replace('.pdf', '_extracted.txt')
            with open(out_path, 'w', encoding='utf-8') as out_f:
                out_f.write(text)
            print(f"Extracted to {out_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

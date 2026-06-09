import PyPDF2

with open("public/downloads/menu.pdf", "rb") as f:
    reader = PyPDF2.PdfReader(f)
    text = ""
    for i in range(len(reader.pages)):
        text += reader.pages[i].extract_text() + "\n"

with open("menu_text.txt", "w", encoding="utf-8") as out:
    out.write(text)

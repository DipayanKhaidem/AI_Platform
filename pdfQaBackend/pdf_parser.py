
import fitz  

# def extract_metadata(doc):
#     meta = doc.metadata
#     return {
#         "title": meta.get("title", "Unknown"),
#         "author": meta.get("author", "Unknown"),
#         "subject": meta.get("subject", "Unknown")
#     }
def extract_metadata(doc):
    meta = doc.metadata or {}
    title = meta.get("title", "").strip()
    author = meta.get("author", "").strip()

   
    if not title or not author:
        text_lines = doc[0].get_text().split("\n")
        
        candidates = [line.strip() for line in text_lines if line.strip()]
        if not title and candidates:
            title = candidates[0]
        if not author and len(candidates) > 1:
            author = candidates[1]

    return {
        "title": title or "Unknown Title",
        "author": author or "Unknown Author"
    }


def fallback_title_from_page(doc):
    page1 = doc[0]
    text = page1.get_text().strip().split("\n")
    for line in text:
        if len(line.strip()) > 10:
            return line.strip()
    return "Unknown Title"


def parse_pdf(file_path):
    doc = fitz.open(file_path)
    chunks = []
    fallback_title = fallback_title_from_page(doc)

    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")['blocks']
        for block in blocks:
            if block['type'] == 0:
                for line in block['lines']:
                    text = ' '.join([span['text'].strip() for span in line['spans']])
                    if len(text) > 30:
                        chunks.append({
                            "text": text,
                            "page_num": page_num + 1
                        })

    metadata = extract_metadata(doc)
    if metadata.get("title") in ["", None, "Unknown"]:
        metadata["title"] = fallback_title
    return chunks, metadata


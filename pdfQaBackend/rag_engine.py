
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json

embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def build_faiss_index(chunks, session_id):
    texts = [chunk['text'] for chunk in chunks]
    embeddings = embedding_model.encode(texts, convert_to_numpy=True)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("indexes", exist_ok=True)
    faiss.write_index(index, f"indexes/{session_id}.index")

    with open(f"indexes/{session_id}_meta.json", 'w') as f:
        json.dump(chunks, f)
        
def chunk_pdf_text(text, chunk_size=500):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append({"text": chunk})
    return chunks


def retrieve_chunks(query, session_id, top_k=5):
    index = faiss.read_index(f"indexes/{session_id}.index")
    with open(f"indexes/{session_id}_meta.json", 'r') as f:
        metadata = json.load(f)

    query_vec = embedding_model.encode([query], convert_to_numpy=True)
    _, I = index.search(query_vec, top_k)
    return [metadata[i] for i in I[0]]

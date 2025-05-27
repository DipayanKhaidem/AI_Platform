import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
from typing import List, Dict
import streamlit as st
import ollama

def parse_pdf(file_path:str)->List[Dict]:
    doc=fitz.open(file_path)
    parsed_chunks=[]

    for page_num,page in enumerate(doc):
        blocks=page.get_text("dict")['blocks']

        for block in blocks:
            if block['type']==0: 
                for line in block['lines']:
                    for span in line['spans']:
                        text=span['text'].strip()
                        if len(text)>20:
                            parsed_chunks.append({
                                "text":text,
                                "font_size":span['size'],
                                "bbox":span['bbox'],
                                "page_num":page_num+1,
                                "font":span['font']
                            })
        
        for img_index, img in enumerate(page.get_images(full=True)):
            xref=img[0]
            image=doc.extract_image(xref)
            img_bytes=image['image']
            img_ext=image['ext']
            with open(f"extracted_image_{page_num + 1}_{img_index + 1}.{img_ext}","wb") as img_out:
                img_out.write(img_bytes)
    
    return parsed_chunks

def build_faiss_index(chunks:List[Dict],index_path:str="faiss.index",metadata_path:str="metadata.json"):
    texts=[chunk['text'] for chunk in chunks]
    embeddings=embedding_model.encode(texts,convert_to_numpy=True)

    index=faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index,index_path)
    with open(metadata_path,'w',encoding='utf-8') as f:
        json.dump(chunks,f,ensure_ascii=False,indent=2)

    print("Saved FAISS index and metadata")

def retrieve_chunks(query: str, index_path: str, metadata_path: str, top_k: int = 5) -> List[Dict]:
    index = faiss.read_index(index_path)
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    query_vec = embedding_model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_vec, top_k)
    results = [metadata[i] for i in I[0]]
    return results

def generate_answer_ollama(context: List[Dict], query: str, model: str = "llama3") -> str:
    context_text = "\n".join([f"Page {c['page_num']}: {c['text']}" for c in context])
    prompt = f"Context:\n{context_text}\n\nQuestion: {query}\nAnswer:"
    response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    return response['message']['content']

st.title("📄 PDF Question Answering System")

pdf_file = st.file_uploader("Upload a PDF", type="pdf")

if pdf_file:
    with open("uploaded.pdf", "wb") as f:
        f.write(pdf_file.read())

    st.success("PDF uploaded and saved.")

    if st.button("Parse and Index PDF"):
        st.info("Parsing PDF...")
        chunks = parse_pdf("uploaded.pdf")
        build_faiss_index(chunks)
        st.success("PDF indexed successfully.")

query = st.text_input("Ask a question (English or Manipuri supported)")

if st.button("Get Answer") and query:
    st.info("Retrieving relevant chunks...")
    chunks = retrieve_chunks(query, "faiss.index", "metadata.json")

    st.info("Generating answer with LLaMA 3...")
    answer = generate_answer_ollama(chunks, query)

    st.subheader("Answer:")
    st.write(answer)

    with st.expander("Show Retrieved Chunks"):
        for chunk in chunks:
            st.markdown(f"**Page {chunk['page_num']}**: {chunk['text']}")



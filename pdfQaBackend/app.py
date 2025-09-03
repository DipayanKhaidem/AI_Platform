from flask import Flask, request, jsonify
from flask_cors import CORS
from translator import translate_to_english, is_transliterated_manipuri
from rag_engine import chunk_pdf_text, build_faiss_index, retrieve_chunks
import fitz  # PyMuPDF
import ollama
import tempfile
import os

app = Flask(__name__)
CORS(app)

conversations = {}

@app.route('/api/pdfqa', methods=['POST'])
def handle_pdf_qa():
    file = request.files['file']
    question = request.form['question']
    session_id = request.form['session_id']

    if session_id not in conversations:
        conversations[session_id] = []

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        file.save(temp.name)
        pdf_path = temp.name

    text = extract_pdf_text(pdf_path)
    metadata = extract_pdf_metadata(pdf_path)
    chunks = chunk_pdf_text(text)
    build_faiss_index(chunks, session_id)

   
    if is_transliterated_manipuri(question):
        try:
            question = translate_to_english(question)
        except Exception as e:
            print("Translation error:", e)
            return jsonify({"error": "Translation failed"}), 500

    retrieved_chunks = retrieve_chunks(question, session_id)
    context_text = "\n\n".join([chunk['text'] for chunk in retrieved_chunks])

    prompt = build_prompt(context_text, question, conversations[session_id])
    response = ollama.chat(model='llama3', messages=prompt)
    answer_en = response['message']['content'].strip()

    conversations[session_id].append({"role": "user", "content": question})
    conversations[session_id].append({"role": "assistant", "content": answer_en})

    return jsonify({
        "answer": {
            "en": answer_en,
            "mni": None
        },
        "metadata": metadata
    })

@app.route('/api/summary', methods=['POST'])
def summarize_pdf():
    file = request.files['file']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        file.save(temp.name)
        pdf_path = temp.name

    text = extract_pdf_text(pdf_path)
    prompt = f"Summarize the following PDF content:\n\n{text}"

    response = ollama.chat(model='llama3', messages=[
        {"role": "system", "content": "You are a helpful assistant that summarizes PDF content."},
        {"role": "user", "content": prompt}
    ])
    summary = response['message']['content'].strip()

    return jsonify({
        "summary": summary
    })

def extract_pdf_text(path):
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc).strip()

def extract_pdf_metadata(path):
    doc = fitz.open(path)
    meta = doc.metadata
    return {
        "title": meta.get('title', ''),
        "author": meta.get('author', ''),
        "subject": meta.get('subject', ''),
        "keywords": meta.get('keywords', ''),
    }

def build_prompt(context, question, chat_history):
    system_prompt = {"role": "system", "content": "You are an expert PDF question answering assistant."}
    messages = [system_prompt] + chat_history + [{"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}]
    return messages

if __name__ == '__main__':
    app.run(port=5001)

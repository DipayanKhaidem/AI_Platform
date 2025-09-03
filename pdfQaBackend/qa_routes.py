
from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER
from pdf_parser import parse_pdf
from rag_engine import build_faiss_index, retrieve_chunks
from llm_answer import generate_answer, generate_summary

qa_bp = Blueprint('qa', __name__)

@qa_bp.route('/api/pdfqa', methods=['POST'])
def handle_pdf_qa():
    file = request.files['file']
    question = request.form['question']
    session_id = request.form['session_id']
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
    file.save(filepath)

    chunks, metadata = parse_pdf(filepath)
    build_faiss_index(chunks, session_id)
    retrieved = retrieve_chunks(question, session_id)
    answer = generate_answer(retrieved, question)

    return jsonify({"answer": answer, "metadata": metadata})

@qa_bp.route('/api/summary', methods=['POST'])
def handle_summary():
    file = request.files['file']
    session_id = request.form['session_id']
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
    file.save(filepath)

    chunks, metadata = parse_pdf(filepath)
    build_faiss_index(chunks, session_id)
    summary = generate_summary(chunks)

    return jsonify({"summary": summary, "metadata": metadata})

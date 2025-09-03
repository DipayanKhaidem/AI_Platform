
# import ollama

# def generate_answer(context_chunks, question, model="llama3"):
#     context_text = "\n".join([f"Page {c['page_num']}: {c['text']}" for c in context_chunks])
#     prompt = (
#         f"Context from a PDF:\n{context_text}\n\n"
#         f"Based on the content or top of the document, answer this:\n{question}\n\n"
#         f"If the title is not explicitly stated, try to guess based on the opening text.\nAnswer:"
#     )
#     response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
#     return response['message']['content']

# def generate_summary(context_chunks, model="llama3"):
#     context_text = "\n".join([f"{c['text']}" for c in context_chunks[:10]])  # Top 10 chunks
#     prompt = f"Summarize the content below:\n{context_text}\n\nSummary:"
#     response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
#     return response['message']['content']

import ollama
from langdetect import detect
from translator import (
    indic_translate,
    transliterate_to_roman,
    transliterate_to_script,
    en2mni_model,
    en2mni_tokenizer,
    mni2en_model,
    mni2en_tokenizer,
)

def is_romanized_manipuri(text):
    manipuri_clues = ['hou', 'eikhoigi', 'nattraga', 'phangjaba', 'houjik']
    return any(clue in text.lower() for clue in manipuri_clues)

def generate_answer_ollama(context_chunks, query, metadata=None, model='llama3'):
    context_text = "\n".join([f"Page {chunk['page_num']}: {chunk['text']}" for chunk in context_chunks])
    metadata = metadata or {}

    original_query = query
    detected_lang = 'en'
    
    try:
        detected_lang = detect(query)
    except:
        pass

   
    if is_romanized_manipuri(query) or detected_lang not in ['en']:
       
        mm_text = transliterate_to_script(query)
        query = indic_translate(mm_text, source_lang='mni', target_lang='eng', model=mni2en_model, tokenizer=mni2en_tokenizer)
        detected_lang = 'mni'

   
    prompt = (
        f"You are a helpful assistant answering questions based on the uploaded PDF.\n\n"
        f"Metadata:\nTitle: {metadata.get('title', 'N/A')}\nAuthor: {metadata.get('author', 'N/A')}\nSubject: {metadata.get('subject', 'N/A')}\n\n"
        f"Context:\n{context_text}\n\n"
        f"Question: {query}\nAnswer:"
    )

    try:
        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response['message']['content']
    except Exception as e:
        answer = f"Error generating answer: {str(e)}"

    
    if detected_lang == 'mni':
        mm_back = indic_translate(answer, source_lang='eng', target_lang='mni', model=en2mni_model, tokenizer=en2mni_tokenizer)
        answer = transliterate_to_roman(mm_back)

    return answer

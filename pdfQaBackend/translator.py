from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from aksharamukha import transliterate
import torch

# Load IndicTrans2 models
en2mni_tokenizer = AutoTokenizer.from_pretrained(
    "ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True
)
en2mni_model = AutoModelForSeq2SeqLM.from_pretrained(
    "ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True
)

mni2en_tokenizer = AutoTokenizer.from_pretrained(
    "ai4bharat/indictrans2-indic-en-1B", trust_remote_code=True
)
mni2en_model = AutoModelForSeq2SeqLM.from_pretrained(
    "ai4bharat/indictrans2-indic-en-1B", trust_remote_code=True
)


def translate_to_target(text, target_lang="mni"):
    """
    Translate from English to Manipuri (or other target language)
    """
    inputs = en2mni_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    output = en2mni_model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        forced_bos_token_id=en2mni_tokenizer.lang_code_to_id[target_lang]
    )
    return en2mni_tokenizer.batch_decode(output, skip_special_tokens=True)[0]


def translate_to_english(text):
    """
    Translate from Manipuri to English (auto-handles source language as 'mni')
    """
    inputs = mni2en_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    output = mni2en_model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        forced_bos_token_id=mni2en_tokenizer.lang_code_to_id["en"]
    )
    return mni2en_tokenizer.batch_decode(output, skip_special_tokens=True)[0]


def is_transliterated_manipuri(text):
    """
    Check if the given text appears to be Manipuri written in Roman script.
    """
    common_words = ["houjikti", "nahakki", "eemagi", "khallabani", "nattraga"]
    return any(word in text.lower() for word in common_words)


def transliterate_to_script(text, script="MeeteiMayek"):
    """
    Convert Romanized Manipuri to Meetei Mayek script using Aksharamukha.
    """
    return transliterate.process("ISO", script, text)


def transliterate_to_roman(text, script="MeeteiMayek"):
    """
    Convert Meetei Mayek script to Romanized Manipuri using Aksharamukha.
    """
    return transliterate.process(script, "ISO", text)

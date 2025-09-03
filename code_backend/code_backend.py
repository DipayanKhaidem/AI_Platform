from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
import re
import json

app = Flask(__name__)
CORS(app)

conversations = {}

# Utility: Detect intent based on prompt
def detect_intent(prompt: str) -> str:
    prompt = prompt.lower()
    if any(word in prompt for word in ["explain", "describe", "what does", "analyze"]):
        return "explanation"
    elif "optimize" in prompt:
        return "optimize"
    else:
        return "code"

# Utility: Extract programming language
def extract_language(prompt: str) -> str:
    match = re.search(r'in\s+(\w+\+\+|\w+)', prompt.lower())
    return match.group(1) if match else "code"

# Prompt construction
def build_prompt(prompt: str, optimize: bool = False) -> str:
    intent = detect_intent(prompt)
    language = extract_language(prompt)

    if intent == "explanation":
        return f"Please explain the following {language} code:\n\n{prompt}"
    elif optimize:
        return (
            f"Please optimize the following {language} code:\n\n{prompt}\n\n"
            f"Return only the optimized code, wrapped in triple backticks (```). No extra explanations."
        )
    else:
        return (
            f"Write a {language} program or snippet for the following requirement:\n\n{prompt}\n\n"
            f"Return only the code, wrapped in triple backticks (```). Do not include any explanation."
        )

# Code generation endpoint
@app.route("/api/code", methods=["POST"])
def generate_code():
    data = request.get_json()
    prompt = data.get("prompt")
    optimize = data.get("optimize", False)
    session_id = data.get("session_id", "default")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        full_prompt = build_prompt(prompt, optimize)

        # Initialize session
        if session_id not in conversations:
            conversations[session_id] = [
                {
                    "role": "system",
                    "content": (
                        "You are a helpful coding assistant. "
                        "When users ask for code, return only the code wrapped in triple backticks (```). "
                        "Do not add any extra explanation unless specifically asked to explain."
                    )
                }
            ]

        conversations[session_id].append({"role": "user", "content": full_prompt})

        # Get code from LLM
        response = ollama.chat(model="llama3", messages=conversations[session_id])
        code = response["message"]["content"]
        conversations[session_id].append({"role": "assistant", "content": code})

        reason = ""
        metrics_data = {}

        # If optimization requested, explain and evaluate
        if optimize:
            # Explanation: Why optimized version is better
            explanation_prompt = (
                f"Compare the original and optimized code below and explain the improvements:\n\n"
                f"Original Code:\n{prompt}\n\nOptimized Code:\n{code}"
            )
            explanation = ollama.chat(model="llama3", messages=[{"role": "user", "content": explanation_prompt}])
            reason = explanation["message"]["content"]

            # Metrics: Estimate time/space complexity
            metrics_prompt = f"""
Estimate and compare the runtime performance and memory usage (space complexity) between the following two versions of code. Give the result as a JSON:
{{
  "time_complexity": {{ "original": "...", "optimized": "..." }},
  "space_complexity": {{ "original": "...", "optimized": "..." }},
  "remarks": "..."
}}

Original Code:
{prompt}

Optimized Code:
{code}
"""
            metrics_response = ollama.chat(model="llama3", messages=[{"role": "user", "content": metrics_prompt}])
            metrics_text = metrics_response["message"]["content"]

            try:
                metrics_data = json.loads(metrics_text.strip())
            except json.JSONDecodeError:
                metrics_data = {"error": "Failed to parse metrics"}

        return jsonify({
            "code": code,
            "reason": reason,
            "metrics": metrics_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Clear session history
@app.route("/api/clear", methods=["POST"])
def clear_session():
    session_id = request.get_json().get("session_id", "default")
    conversations.pop(session_id, None)
    return jsonify({"status": "cleared"})

# Run server
if __name__ == "__main__":
    app.run(debug=True, port=5002)

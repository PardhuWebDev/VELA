import os
import requests
from dotenv import load_dotenv

load_dotenv()

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def _llm_generate(prompt: str) -> str:
    model = os.getenv("OLLAMA_MODEL", "llama3")
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    response = requests.post(
        f"{base_url}/api/generate",
        json={"model": model, "prompt": prompt, "stream": False}
    )
    return response.json().get("response", "").strip()

def create_file(filename: str, content: str = "") -> dict:
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w") as f:
        f.write(content)
    return {"status": "success", "message": f"File created: output/{filename}", "output": content}

def write_code(filename: str, language: str, description: str) -> dict:
    prompt = f"Write {language} code for: {description}. Return only the code, no explanation."
    code = _llm_generate(prompt)
    return create_file(filename, code)

def summarize(content: str) -> dict:
    prompt = f"Summarize the following text concisely:\n\n{content}"
    summary = _llm_generate(prompt)
    return {"status": "success", "message": "Text summarized.", "output": summary}

def chat(content: str) -> dict:
    response = _llm_generate(content)
    return {"status": "success", "message": "Chat response generated.", "output": response}

def execute(intent_data: dict) -> dict:
    intents = intent_data.get("intents", ["chat"])
    filename = intent_data.get("filename", "output.txt")
    language = intent_data.get("language", "python")
    content = intent_data.get("content", "")

    if "write_code" in intents:
        return write_code(filename, language, content)
    elif "summarize" in intents:
        return summarize(content)
    elif "create_file" in intents:
        return create_file(filename, content)
    else:
        return chat(content)
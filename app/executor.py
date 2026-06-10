import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def _llm_generate(prompt: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()

def write_code(filename: str, language: str, description: str) -> dict:
    prompt = f"Write {language} code for: {description}. Return only the code, no explanation."
    code = _llm_generate(prompt)
    return {"status": "success", "message": f"Code generated for {filename}", "output": code}

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
        return {"status": "success", "message": f"File '{filename}' ready.", "output": content}
    else:
        return chat(content)

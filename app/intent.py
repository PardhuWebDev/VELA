import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

INTENT_PROMPT = """You are an intent classifier for a voice-controlled AI agent.
Given a user's transcribed speech, classify the intent into one or more of these exact values:
- create_file
- write_code
- summarize
- chat
Also extract:
- filename: the file to create (default: output.py for code, output.txt for others)
- language: programming language if code is requested (default: python)
- content: description of what to generate or the text to summarize
Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks.
Example: {{"intents": ["write_code", "create_file"], "filename": "hello.py", "language": "python", "content": "a hello world function"}}
User said: {text}"""

def classify_intent(text: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = INTENT_PROMPT.format(text=text)
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        raw = response.choices[0].message.content
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            if "intents" not in parsed:
                parsed["intents"] = ["chat"]
            if "content" not in parsed:
                parsed["content"] = text
            return parsed
    except Exception as e:
        print(f"[intent] error: {e}")
    return {"intents": ["chat"], "content": text, "filename": "output.txt", "language": "python"}

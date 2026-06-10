import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def transcribe(audio_path: str, use_groq: bool = True) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    with open(audio_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            response_format="text"
        )
    return transcription.strip()

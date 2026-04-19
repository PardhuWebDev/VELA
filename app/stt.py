import whisper
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def transcribe_local(audio_path: str) -> str:
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    return result["text"].strip()

def transcribe_groq(audio_path: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    with open(audio_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            response_format="text"
        )
    return transcription.strip()

def transcribe(audio_path: str, use_groq: bool = False) -> str:
    if use_groq:
        return transcribe_groq(audio_path)
    return transcribe_local(audio_path)
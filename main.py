from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, tempfile
from app.stt import transcribe
from app.intent import classify_intent
from app.executor import execute

app = FastAPI(title="VELA - Voice Enabled Local Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "VELA is running"}

@app.post("/process")
async def process_audio(
    audio: UploadFile = File(...),
    use_groq: bool = Form(False)
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1]) as tmp:
        shutil.copyfileobj(audio.file, tmp)
        tmp_path = tmp.name

    try:
        transcription = transcribe(tmp_path, use_groq=use_groq)
        intent_data = classify_intent(transcription)
        result = execute(intent_data)

        return {
            "transcription": transcription,
            "intent": intent_data,
            "action": result["message"],
            "output": result["output"]
        }
    finally:
        os.unlink(tmp_path)
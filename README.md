# VELA - Voice Enabled Local Agent

A voice-controlled AI agent that accepts audio input, transcribes it, classifies intent, executes local tools, and displays results in a clean split-panel UI.

Built by [Pardhu](https://github.com/PardhuWebDev)

---

## Architecture

Audio Input (mic / file) -> Speech-to-Text (Whisper / Groq) -> Intent Classification (llama3.2 via Ollama) -> Tool Execution -> React UI

---

## Supported Intents

| Intent | Description |
|--------|-------------|
| write_code | Generate code and save to output/ |
| create_file | Create a file with given content |
| summarize | Summarize provided text |
| chat | General conversation via LLM |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Speech-to-Text | OpenAI Whisper (local) / Groq API (cloud fallback) |
| Intent and Code LLM | llama3.2:1b via Ollama |
| Backend | FastAPI + Python |
| Frontend | React + Vite |
| Storage | Local filesystem (output/ directory) |

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Ollama installed and running
- FFmpeg on PATH
- Groq API key (free at console.groq.com)

### 1. Clone the repo
git clone https://github.com/PardhuWebDev/VELA.git
cd VELA

### 2. Python backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn openai-whisper groq python-dotenv pydantic requests

### 3. Environment variables
Create a .env file in the root:
GROQ_API_KEY=your_groq_api_key_here
OLLAMA_MODEL=llama3.2:1b
OLLAMA_BASE_URL=http://localhost:11434

### 4. Pull the LLM
ollama pull llama3.2:1b

### 5. React frontend
cd ui-web
npm install
npm run dev

### 6. Run the backend
uvicorn main:app --reload

### 7. Open the app
http://localhost:5173

---

## Hardware Notes

- Local Whisper (base model) runs on CPU and is slow on low-end machines
- Enable Groq API toggle in UI for near-instant transcription
- llama3.2:1b needs ~1.5GB RAM, use instead of llama3 on machines under 6GB RAM

---

## Safety

All file creation and code writing is restricted to the output/ directory.

---

## License

MIT

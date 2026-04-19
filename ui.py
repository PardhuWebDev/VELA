import gradio as gr
import requests
import os

API_URL = "http://localhost:8000/process"

def process_audio(audio_path, use_groq):
    if audio_path is None:
        return "No audio provided.", "", "", ""

    with open(audio_path, "rb") as f:
        response = requests.post(
            API_URL,
            files={"audio": (os.path.basename(audio_path), f)},
            data={"use_groq": str(use_groq).lower()}
        )

    if response.status_code != 200:
        return f"Error: {response.text}", "", "", ""

    data = response.json()
    intents = ", ".join(data["intent"].get("intents", []))
    return (
        data.get("transcription", ""),
        intents,
        data.get("action", ""),
        data.get("output", "")
    )

with gr.Blocks(
    theme=gr.themes.Base(),
    css="""
    body { background-color: #0a0a0a; }
    .gradio-container {
        background-color: #0a0a0a !important;
        font-family: 'GeistMono', 'Courier New', monospace !important;
        max-width: 860px !important;
        margin: 0 auto !important;
    }
    .block { background-color: #111111 !important; border: 1px solid #222 !important; border-radius: 8px !important; }
    label { color: #888 !important; font-size: 11px !important; letter-spacing: 0.1em !important; text-transform: uppercase !important; }
    textarea, input { background-color: #0a0a0a !important; color: #e0e0e0 !important; border: 1px solid #222 !important; }
    .svelte-1ipelgc { color: #e0e0e0 !important; }
    button.primary { background-color: #e0e0e0 !important; color: #0a0a0a !important; font-weight: 600 !important; border-radius: 6px !important; }
    button.primary:hover { background-color: #ffffff !important; }
    #title { text-align: center; padding: 32px 0 8px 0; }
    #title h1 { color: #ffffff; font-size: 2rem; letter-spacing: 0.15em; font-weight: 700; }
    #title p { color: #555; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
    """
) as demo:

    with gr.Column(elem_id="title"):
        gr.HTML("<h1>VELA</h1><p>Voice Enabled Local Agent — by Pardhu</p>")

    with gr.Row():
        with gr.Column(scale=1):
            audio_input = gr.Audio(
                sources=["microphone", "upload"],
                type="filepath",
                label="Audio Input"
            )
            use_groq = gr.Checkbox(label="Use Groq API for STT (faster, cloud-based)", value=False)
            run_btn = gr.Button("Run Agent", variant="primary")

        with gr.Column(scale=1):
            transcription_out = gr.Textbox(label="Transcription", lines=3, interactive=False)
            intent_out = gr.Textbox(label="Detected Intent", lines=1, interactive=False)
            action_out = gr.Textbox(label="Action Taken", lines=1, interactive=False)
            output_out = gr.Textbox(label="Output", lines=6, interactive=False)

    run_btn.click(
        fn=process_audio,
        inputs=[audio_input, use_groq],
        outputs=[transcription_out, intent_out, action_out, output_out]
    )

if __name__ == "__main__":
    demo.launch(server_port=7860)
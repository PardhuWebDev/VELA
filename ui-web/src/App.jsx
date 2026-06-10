import { useState, useRef } from "react";

const API = "https://vela-production-6863.up.railway.app/process";

export default function App() {
  const [status, setStatus] = useState("idle");
  const [useGroq, setUseGroq] = useState(true);
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const fileRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRef.current.ondataavailable = e => chunksRef.current.push(e.data);
    mediaRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm", { type: "audio/webm" });
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(blob));
    };
    mediaRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => { mediaRef.current?.stop(); setRecording(false); };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setAudioURL(URL.createObjectURL(file));
  };

  const handleRun = async () => {
    if (!audioFile) return;
    setStatus("loading");
    setError(null);
    setResult(null);
    const form = new FormData();
    form.append("audio", audioFile);
    form.append("use_groq", useGroq);
    try {
      const res = await fetch(API, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleCopy = () => {
    if (result?.output) navigator.clipboard.writeText(result.output);
  };

  const statusColor = { idle: "#ffffff20", loading: "#ffd60a", success: "#30d158", error: "#ff453a" }[status];
  const hasOutput = result?.output;

  return (
    <div style={{ height: "100vh", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Orbs */}
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,80,255,0.35) 0%, transparent 70%)", top: -200, left: -150, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,120,0.25) 0%, transparent 70%)", bottom: -150, right: -100, pointerEvents: "none" }} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .btn:hover { background: rgba(255,255,255,0.11) !important; }
        .copy-btn:hover { background: rgba(255,255,255,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Top Bar */}
      <div style={{
        height: 52, borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", padding: "0 24px",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)",
        flexShrink: 0, zIndex: 20, gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: status !== "idle" ? `0 0 8px ${statusColor}` : "none", transition: "all 0.3s", animation: status === "loading" ? "pulse 1s infinite" : "none" }} />
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fff 0%, #a78bfa 40%, #f472b6 70%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>VELA</span>
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Voice Enabled Local Agent</span>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>github.com/PardhuWebDev</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left Panel */}
        <div style={{
          width: hasOutput ? 340 : "100%",
          maxWidth: hasOutput ? 340 : 480,
          margin: hasOutput ? "0" : "0 auto",
          borderRight: hasOutput ? "1px solid rgba(255,255,255,0.07)" : "none",
          padding: "32px 24px",
          overflowY: "auto", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 20,
          transition: "all 0.3s ease"
        }}>

          {/* Audio Input */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Audio Input</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button className="btn" onClick={recording ? stopRecording : startRecording} style={{
                flex: 1, padding: "11px 14px", borderRadius: 12,
                background: recording ? "rgba(255,69,58,0.1)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${recording ? "rgba(255,69,58,0.3)" : "rgba(255,255,255,0.09)"}`,
                color: recording ? "#ff453a" : "rgba(255,255,255,0.8)",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s"
              }}>
                {recording ? "⏹ Stop" : "🎙 Record"}
              </button>
              <button className="btn" onClick={() => fileRef.current?.click()} style={{
                flex: 1, padding: "11px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s"
              }}>
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </div>

            {audioURL && <audio controls src={audioURL} style={{ width: "100%", height: 32, borderRadius: 8, opacity: 0.7, marginBottom: 8 }} />}

            {audioFile && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", background: "rgba(255,255,255,0.04)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#30d158", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {audioFile.name} · {(audioFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          {/* Groq Toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "11px 14px", cursor: "pointer"
          }} onClick={() => setUseGroq(!useGroq)}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Groq API for STT</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>Faster cloud transcription</div>
            </div>
            <div style={{ width: 40, height: 23, borderRadius: 12, position: "relative", transition: "background 0.25s", background: useGroq ? "linear-gradient(135deg, #a78bfa, #38bdf8)" : "rgba(255,255,255,0.1)", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2.5, left: useGroq ? 19 : 2.5, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s" }} />
            </div>
          </div>

          {/* Run Button */}
          <button onClick={handleRun} disabled={!audioFile || status === "loading"} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: !audioFile || status === "loading"
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #7c3aed, #db2777, #0ea5e9)",
            color: !audioFile || status === "loading" ? "rgba(255,255,255,0.2)" : "#fff",
            fontSize: 14, fontWeight: 600, cursor: !audioFile || status === "loading" ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: audioFile && status !== "loading" ? "0 0 30px rgba(124,58,237,0.3)" : "none"
          }}>
            {status === "loading" ? "Processing..." : "Run Agent"}
          </button>

          {error && (
            <div style={{ padding: "11px 14px", background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", borderRadius: 10, fontSize: 12, color: "#ff453a" }}>
              {error}
            </div>
          )}

          {/* Meta cards */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Transcription", value: result.transcription },
                { label: "Detected Intent", value: result.intent?.intents?.join(", ") },
                { label: "Action Taken", value: result.action, green: true },
              ].map(({ label, value, green }) => (
                <div key={label} style={{
                  background: green ? "rgba(48,209,88,0.06)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${green ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10, padding: "10px 13px"
                }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 12, color: green ? "#30d158" : "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel — Code Output */}
        {hasOutput && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Code Topbar */}
            <div style={{
              height: 44, borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
              background: "rgba(255,255,255,0.02)", flexShrink: 0
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {result.intent?.filename || "output.py"}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="copy-btn" onClick={handleCopy} style={{
                  padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)",
                  fontSize: 11, cursor: "pointer", transition: "all 0.2s", fontFamily: "monospace"
                }}>
                  Copy
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <pre style={{
                margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.85)",
                whiteSpace: "pre-wrap", wordBreak: "break-word", tabSize: 4
              }}>
                {result.output.split('\n').map((line, i) => (
                  <div key={i} style={{ display: "flex", gap: 20 }}>
                    <span style={{ color: "rgba(255,255,255,0.15)", userSelect: "none", minWidth: 24, textAlign: "right", fontSize: 12 }}>
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* Empty right state */}
        {!hasOutput && status !== "idle" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.15)" }}>Output will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
}

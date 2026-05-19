import { useState } from "react";
import axios from "axios";
import "./index.css";

const LANGUAGES = ["javascript", "typescript", "python", "java", "c++", "go", "rust", "php", "ruby", "other"];

const scoreColor = (s) => s >= 8 ? "#00d68f" : s >= 5 ? "#ffb800" : "#ff3b3b";

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState(null);
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roasting, setRoasting] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true); setReview(null); setRoast(null); setError(null); setMode("review");
    try {
      const { data } = await axios.post("https://ai-code-reviewer-yjab.onrender.com/api/review", { code, language });
      setReview(data);
    } catch {
      setError("Something went wrong. Make sure your server is running.");
    } finally { setLoading(false); }
  };

  const handleRoast = async () => {
    if (!code.trim()) return;
    setRoasting(true); setReview(null); setRoast(null); setError(null); setMode("roast");
    try {
      const { data } = await axios.post("https://ai-code-reviewer-yjab.onrender.com/api/roast", { code, language }, { timeout: 60000 });
      setRoast(data);
    } catch {
      setError("Something went wrong. Make sure your server is running.");
    } finally { setRoasting(false); }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1 className="logo">code<span className="logo-dot">.</span>review</h1>
          <span className="version">v1.0</span>
        </div>
        <p className="tagline">Going to a senior dev is embarassing. Find bugs, security, improvements in your code. Definitely consult a senior dev after this.</p>
      </header>

      <div className="controls">
        <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <span className="char-count">{code.length} chars · {code.split("\n").length} lines</span>
      </div>

      <textarea
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Paste your code here..."
        spellCheck={false}
      />

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleReview} disabled={loading || roasting || !code.trim()}>
          {loading ? "Analyzing...(may take up to 30s on first load)" : "Review Code"}
        </button>
        <button className="btn btn-roast" onClick={handleRoast} disabled={loading || roasting || !code.trim()}>
          {roasting ? "Preparing brutal feedback...(may take up to 30s on first load)" : "Roast Code"}
        </button>
      </div>

      {(loading || roasting) && (
        <div className="loading">
          <div className="spinner" />
          {roasting ? "Preparing brutal feedback..." : "Analyzing your code..."}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {/* Roast Results */}
      {roast && (
        <div className="results">
          <div className="roast-block">
            <div className="roast-opening">"{roast.opening}"</div>
            <ul className="roast-list">
              {roast.roasts?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <div className="roast-verdict">{roast.verdict}</div>
          </div>
        </div>
      )}

      {/* Review Results */}
      {review && (
        <div className="results">
          <div className="score-block">
            <div>
              <div className="score-number" style={{ color: scoreColor(review.score) }}>{review.score}</div>
              <div className="score-label">out of 10</div>
            </div>
            <p className="score-summary">{review.summary}</p>
          </div>

          {review.bugs?.length > 0 && (
            <div className="section">
              <div className="section-title">Bugs ({review.bugs.length})</div>
              {review.bugs.map((b, i) => (
                <div className="card" key={i}>
                  <div className="card-meta">{b.line}</div>
                  <div>{b.issue}</div>
                  <div className="card-fix">Fix: {b.fix}</div>
                </div>
              ))}
            </div>
          )}

          {review.security?.length > 0 && (
            <div className="section">
              <div className="section-title">Security ({review.security.length})</div>
              {review.security.map((s, i) => (
                <div className="card" key={i}>
                  <span className={`badge badge-${s.severity}`}>{s.severity}</span>
                  <div>{s.issue}</div>
                  <div className="card-fix">Fix: {s.fix}</div>
                </div>
              ))}
            </div>
          )}

          {review.improvements?.length > 0 && (
            <div className="section">
              <div className="section-title">Improvements ({review.improvements.length})</div>
              {review.improvements.map((imp, i) => (
                <div className="card" key={i}>
                  <div className="card-category">{imp.category}</div>
                  <div>{imp.suggestion}</div>
                </div>
              ))}
            </div>
          )}

          {review.positives?.length > 0 && (
            <div className="section">
              <div className="section-title">What You Did Well</div>
              {review.positives.map((p, i) => (
                <div className="positive-item" key={i}>{p}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
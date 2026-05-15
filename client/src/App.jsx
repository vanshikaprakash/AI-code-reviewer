import { useState } from "react";
import axios from "axios";

const LANGUAGES = ["javascript", "python", "java", "c++", "typescript", "go", "rust", "php", "ruby", "other"];

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setReview(null);
    setError(null);
    try {
      const { data } = await axios.post("http://localhost:3001/api/review", {
        code,
        language,
      });
      setReview(data);
    } catch (err) {
      setError("Something went wrong. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 8) return "#22c55e";
    if (score >= 5) return "#f59e0b";
    return "#ef4444";
  };

  const severityColor = (s) => {
    if (s === "high") return "#ef4444";
    if (s === "medium") return "#f59e0b";
    return "#3b82f6";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#e5e5e5", fontFamily: "monospace", padding: "2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", color: "#fff", margin: 0 }}>🔍 AI Code Reviewer</h1>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>Paste your code. Get a senior dev review instantly.</p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ background: "#1a1a1a", color: "#e5e5e5", border: "1px solid #333", padding: "0.5rem 1rem", borderRadius: "6px", fontFamily: "monospace" }}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <span style={{ color: "#444", fontSize: "0.85rem" }}>{code.length} chars</span>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          style={{ width: "100%", height: "280px", background: "#1a1a1a", color: "#e5e5e5", border: "1px solid #333", borderRadius: "8px", padding: "1rem", fontFamily: "monospace", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
        />

        <button
          onClick={handleReview}
          disabled={loading || !code.trim()}
          style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: loading ? "#333" : "#fff", color: "#0f0f0f", border: "none", borderRadius: "6px", fontFamily: "monospace", fontWeight: "bold", fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Reviewing..." : "Review My Code →"}
        </button>

        {error && <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>}

        {/* Results */}
        {review && (
          <div style={{ marginTop: "2.5rem" }}>

            {/* Score + Summary */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "2rem", background: "#1a1a1a", padding: "1.5rem", borderRadius: "10px", border: "1px solid #222" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", fontWeight: "bold", color: scoreColor(review.score), lineHeight: 1 }}>{review.score}</div>
                <div style={{ color: "#555", fontSize: "0.75rem" }}>/10</div>
              </div>
              <p style={{ margin: 0, color: "#ccc", lineHeight: 1.6 }}>{review.summary}</p>
            </div>

            {/* Bugs */}
            {review.bugs?.length > 0 && (
              <Section title="🐛 Bugs" color="#ef4444">
                {review.bugs.map((b, i) => (
                  <Card key={i}>
                    <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{b.line}</div>
                    <div style={{ marginBottom: "0.5rem" }}>{b.issue}</div>
                    <div style={{ color: "#22c55e", fontSize: "0.85rem" }}>✓ {b.fix}</div>
                  </Card>
                ))}
              </Section>
            )}

            {/* Security */}
            {review.security?.length > 0 && (
              <Section title="🔒 Security" color="#f59e0b">
                {review.security.map((s, i) => (
                  <Card key={i}>
                    <span style={{ background: severityColor(s.severity), color: "#fff", fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "4px", marginBottom: "0.5rem", display: "inline-block" }}>{s.severity}</span>
                    <div style={{ marginBottom: "0.5rem" }}>{s.issue}</div>
                    <div style={{ color: "#22c55e", fontSize: "0.85rem" }}>✓ {s.fix}</div>
                  </Card>
                ))}
              </Section>
            )}

            {/* Improvements */}
            {review.improvements?.length > 0 && (
              <Section title="⚡ Improvements" color="#3b82f6">
                {review.improvements.map((imp, i) => (
                  <Card key={i}>
                    <span style={{ color: "#3b82f6", fontSize: "0.8rem" }}>{imp.category}</span>
                    <div>{imp.suggestion}</div>
                  </Card>
                ))}
              </Section>
            )}

            {/* Positives */}
            {review.positives?.length > 0 && (
              <Section title="✅ What You Did Well" color="#22c55e">
                {review.positives.map((p, i) => (
                  <Card key={i}>{p}</Card>
                ))}
              </Section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ color, marginBottom: "0.75rem", fontSize: "1rem" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{children}</div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px", padding: "1rem", lineHeight: 1.6, fontSize: "0.9rem" }}>
      {children}
    </div>
  );
}
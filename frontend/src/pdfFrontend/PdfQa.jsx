import React, { useState, useRef } from 'react';
import './PdfQa.css';

const PdfQa = ({ onLogout, onCodeGeneratorNavigate }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [answerMni, setAnswerMni] = useState('');
  const [summary, setSummary] = useState('');
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const sessionId = useRef(Date.now().toString());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    setAnswerEn('');
    setAnswerMni('');
    setQuestion('');
    setSummary('');
    setMetadata({});
    setCopied(false);
  };

  const handleAsk = async () => {
  if (!pdfFile || !question.trim()) return;
  setLoading(true);
  setCopied(false);

  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('question', question);
  formData.append('session_id', sessionId.current);

  try {
    const res = await fetch('http://localhost:5001/api/pdfqa', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setAnswerEn(data.answer?.en || '');
    setAnswerMni(data.answer?.mni || '');
    setMetadata(data.metadata || {});
    setHistory((prev) => [...prev, {
      question,
      answer_en: data.answer?.en || '',
      answer_mni: data.answer?.mni || ''
    }]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};


  const handleSummarize = async () => {
    if (!pdfFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('session_id', sessionId.current);

    try {
      const res = await fetch('http://localhost:5001/api/summary', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setSummary(data.summary || '');
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setAnswerEn('');
    setAnswerMni('');
    setCopied(false);
  };

  return (
    <>
      <nav className="pdfqa-navbar">
        <div className="brand">PdfQA</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-btn" onClick={onCodeGeneratorNavigate}>Code Generator</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="pdfqa-main">
        <aside className="pdfqa-sidebar">
          <h3>Session History</h3>
          {history.length === 0 ? (
            <p style={{ color: '#888' }}>No history yet</p>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                className="pdfqa-history-item"
                onClick={() => {
                  setQuestion(item.question);
                  setAnswerEn(item.answer_en);
                  setAnswerMni(item.answer_mni);
                }}
              >
                {item.question.slice(0, 40)}...
              </div>
            ))
          )}
        </aside>

        <main className="pdfqa-content">
          <h2 className="pdfqa-title">PDF Context-Aware QA</h2>

          <label className="custom-file-upload">
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            Upload PDF
          </label>

          {pdfFile && (
            <p style={{ marginTop: '0.5rem', color: '#666' }}>
              <strong>Uploaded:</strong> {pdfFile.name}
            </p>
          )}

          {metadata.title && (
            <div className="metadata">
              <h4>📄 PDF Metadata:</h4>
              <p><strong>Title:</strong> {metadata.title}</p>
            </div>
          )}

          <textarea
            className="pdfqa-input"
            placeholder="Ask a question based on the uploaded PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="pdfqa-buttons">
            <button className="ask-btn" onClick={handleAsk} disabled={!pdfFile}>Ask</button>
            <button className="clear-btn" onClick={handleClear}>Clear</button>
            <button className="ask-btn" onClick={handleSummarize} disabled={!pdfFile}>Summarize</button>
          </div>

          {loading && <div className="pdfqa-spinner">Loading....</div>}

          {!loading && (answerEn || answerMni) && (
            <div className="pdfqa-output">
              {answerEn && <p><strong>Answer (English):</strong> {answerEn}</p>}
              {answerMni && <p><strong>Answer (Manipuri):</strong> {answerMni}</p>}
            </div>
          )}
          <br></br>
          {!loading && summary && (
            <div className="pdfqa-output">
              <p><strong>Summary:</strong> {summary}</p>
            </div>
          )}

          {!loading && !answerEn && !summary && (
            <p className="empty-state">Your answer or summary will appear here.</p>
          )}
        </main>
      </div>
    </>
  );
};

export default PdfQa;

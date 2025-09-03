import React, { useState, useRef, useEffect } from 'react';
import './CodeGenerator.css';
import { Chart } from 'chart.js/auto';

const CodeGenerator = ({ onLogout, onPdfQaNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [reason, setReason] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);
  const chartRef = useRef(null);
  const sessionId = useRef(Date.now().toString());

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setCopied(false);
    setReason('');
    setMetrics(null);

    try {
      const res = await fetch('http://localhost:5002/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, session_id: sessionId.current })
      });

      const data = await res.json();
      setResponse(data.code || '');
      setHistory(prev => [...prev, { prompt, response: data.code }]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch('http://localhost:5002/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: response, optimize: true, session_id: sessionId.current })
      });

      const data = await res.json();
      setResponse(data.code || '');
      setReason(data.reason || '');
      setMetrics(data.metrics || {});
      setHistory(prev => [...prev,   {
        prompt: 'Optimize',
        response: data.code,
        reason: data.reason,
        metrics: data.metrics
      }]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }

   
  };

  const renderChart = () => {
    if (!metrics || !metrics.time_complexity || !metrics.space_complexity) return;

    const ctx = chartRef.current.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Time Complexity', 'Space Complexity'],
        datasets: [
          {
            label: 'Original',
            data: [
              metrics.time_complexity.original.length,
              metrics.space_complexity.original.length
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          },
          {
            label: 'Optimized',
            data: [
              metrics.time_complexity.optimized.length,
              metrics.space_complexity.optimized.length
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  };

  useEffect(() => {
    if (metrics) renderChart();
  }, [metrics]);

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setReason('');
    setMetrics(null);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleGenerate();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <>
      <nav className="codegen-navbar">
        <div className="brand">CodeGen</div>
        <div style={{display:'flex', gap:'12px'}}>
        <button className='nav-btn' onClick={onPdfQaNavigate}>PDF-QA</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="codegen-main">
        <aside className="codegen-sidebar">
          <h3>Session History</h3>
          {history.length === 0 ? (
            <p style={{ color: '#888' }}>No history yet</p>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="codegen-history-item" onClick={() => {
                setPrompt(item.prompt);
                setResponse(item.response);
                setReason(item.reason || '');
                setMetrics(item.metrics || null);
              }}>
                {item.prompt.slice(0, 40)}...
              </div>
            ))
          )}
        </aside>

        <main className="codegen-content">
          <h2 className="codegen-title">AI Code Generator & Optimizer</h2>

          <textarea
            ref={textareaRef}
            className="prompt-input"
            placeholder="Type your request (e.g., write in Python, optimize, explain)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="codegen-buttons">
            <button className="generate-btn" onClick={handleGenerate}>Generate</button>
            <button className="optimize-btn" onClick={handleOptimize} disabled={!response}>Optimize</button>
            <button className="clear-btn" onClick={handleClear}>Clear</button>
          </div>

          {loading && <div className="codegen-spinner"></div>}<br></br>

          {!loading && response && (
            <div className="codegen-output">
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <pre>{response}</pre>
            </div>
          )}
          <br></br>

          {!loading && reason && (
            <div className="codegen-explanation">
              <h4>Why is the optimized code better?</h4>
              <p>{reason}</p>
            </div>
          )}

          {!loading && metrics && metrics.time_complexity && (
            <div className="codegen-metrics">
              <h4>Estimated Performance Comparison</h4>
              <ul>
                <li><strong>Time Complexity:</strong> Original – {metrics.time_complexity.original}, Optimized – {metrics.time_complexity.optimized}</li>
                <li><strong>Space Complexity:</strong> Original – {metrics.space_complexity.original}, Optimized – {metrics.space_complexity.optimized}</li>
              </ul>
              {metrics.remarks && <p><strong>Remarks:</strong> {metrics.remarks}</p>}
              <canvas ref={chartRef} width="400" height="200"></canvas>
            </div>
          )}
          
        </main>
      </div>
    </>
  );
};

export default CodeGenerator;

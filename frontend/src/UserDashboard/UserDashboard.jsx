import React from 'react';
import './UserDashboard.css';

const UserDashboard = ({ onLogout, onSelectFeature }) => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
                    <div className="nav-brand">
              <span className="brand-name">AI Based Code Gen and Context Aware QA</span>
            </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <h1 className="dashboard-title">What would you like to do?</h1>

        <div className="feature-cards">
          <div className="feature-card">
            <h2 className="feature-name">PDF Q&A</h2>
            <p className="feature-description">
              Upload any PDF and ask questions in English or Manipuri. Our AI will extract context and answer intelligently.
            </p>
            <button
              className="feature-btn"
              onClick={() => onSelectFeature('pdf-qa')}
            >
              Go to PDF Q&A
            </button>
          </div>

          <div className="feature-card">
            <h2 className="feature-name">Code Generation </h2>
            <p className="feature-description">
              Describe what code you need and our AI will generate and optimize it for you, across languages.
            </p>
            <button
              className="feature-btn"
              onClick={() => onSelectFeature('code-generator')}
            >
              Go to Code Generator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

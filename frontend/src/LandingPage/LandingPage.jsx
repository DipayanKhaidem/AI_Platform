import React, { useState } from 'react';
import {
  ChevronDown, FileText, Code, Languages, Zap, Shield, Users, ArrowRight, Menu, X
} from 'lucide-react';
import './LandingPage.css';
import AuthModal from '../Authentication/AuthModal'; // Make sure path is correct

const LandingPage = ({onLoginSuccess}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="landing-page">
    
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <span className="brand-name">AI Based Code Gen and Context Aware QA</span>
            </div>

            <div className="nav-desktop">
              <div className="nav-links">
                <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
                <button className="login-btn" onClick={() => setShowAuth(true)}>Login</button>
              </div>
            </div>

            <div className="nav-mobile">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-button">
                {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <button onClick={() => scrollToSection('features')} className="mobile-link">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="mobile-link">How It Works</button>
              <button onClick={() => setShowAuth(true)} className="mobile-login-btn">Login</button>
            </div>
          </div>
        )}
      </nav>

    
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              AI-Powered Platform for
              <span className="hero-highlight"> Context Aware MultiLingual PDF QA & Code Generation </span>
            </h1>
            <p className="hero-description">
              Upload PDFs and ask questions in English or Manipuri, generate optimized code from prompts
            </p>
            <div className="hero-buttons">
              <button onClick={() => scrollToSection('features')} className="hero-btn-primary">
                Explore Features
              </button>
              <button onClick={() => setShowAuth(true)} className="hero-btn-secondary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

   
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Features</h2>
            <p className="section-description">
              Discover the capabilities that make our platform unique and powerful
            </p>
          </div>
          <div className="features-grid">
            
            <div className="feature-card">
              <div className="feature-icon purple">
                <FileText className="icon" />
              </div>
              <h3 className="feature-title">PDF Q&A System</h3>
              <p className="feature-description">Upload your PDF documents and ask contextual questions.</p>
              <div className="feature-list">
                <div className="feature-item"><div className="feature-dot purple"></div>Contextual understanding</div>
                <div className="feature-item"><div className="feature-dot purple"></div>Instant responses</div>
                <div className="feature-item"><div className="feature-dot purple"></div>Document analysis</div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <Languages className="icon" />
              </div>
              <h3 className="feature-title">Multilingual Support</h3>
              <p className="feature-description">Ask questions in both English and Manipuri.</p>
              <div className="feature-list">
                <div className="feature-item"><div className="feature-dot blue"></div>English support</div>
                <div className="feature-item"><div className="feature-dot blue"></div>Manipuri support</div>
                <div className="feature-item"><div className="feature-dot blue"></div>Natural conversation</div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <Code className="icon" />
              </div>
              <h3 className="feature-title">Code Generation</h3>
              <p className="feature-description">Generate optimized, production-ready code with explanation.</p>
              <div className="feature-list">
                <div className="feature-item"><div className="feature-dot green"></div>Multiple languages</div>
                <div className="feature-item"><div className="feature-dot green"></div>Code optimization</div>
                <div className="feature-item"><div className="feature-dot green"></div>Best practices</div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <Zap className="icon" />
              </div>
              <h3 className="feature-title">AI Optimization</h3>
              <p className="feature-description">Powered by Ollama for local AI processing.</p>
              <div className="feature-list">
                <div className="feature-item"><div className="feature-dot orange"></div>Local processing</div>
                <div className="feature-item"><div className="feature-dot orange"></div>Fast responses</div>
                <div className="feature-item"><div className="feature-dot orange"></div>Privacy focused</div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Get started in three simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Upload & Input</h3>
              <p className="step-description">Upload your PDFs or enter prompts in supported formats.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">AI Processing</h3>
              <p className="step-description">Our Ollama-powered AI handles your data with precision.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Results</h3>
              <p className="step-description">Receive accurate answers or optimized code instantly.</p>
            </div>
          </div>
        </div>
      </section>

    
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onLoginSuccess={()=>onLoginSuccess()}/>
    </div>
  );
};

export default LandingPage;

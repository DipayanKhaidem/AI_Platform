import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage/LandingPage';
import UserDashboard from './UserDashboard/UserDashboard';
import CodeGenerator from './CodeGeneration/CodeGenerator'; 
import PdfQa from './pdfFrontend/PdfQa'; 

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setSelectedFeature(null);
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
  };

  if (!isLoggedIn) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (selectedFeature === 'code-generator') {
    return <CodeGenerator onBack={() => setSelectedFeature(null)} onLogout={handleLogout}  onPdfQaNavigate={()=>setSelectedFeature('pdf-qa')}/>;
  }

  if (selectedFeature === 'pdf-qa') {
     return <PdfQa onBack={() => setSelectedFeature(null)} onLogout={handleLogout} onCodeGeneratorNavigate={()=>setSelectedFeature('code-generator')}/>;
   }

  return <UserDashboard onLogout={handleLogout} onSelectFeature={handleFeatureSelect} />;
};

export default App;

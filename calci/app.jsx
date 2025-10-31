import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './components/Calculator';
import HistoryPanel from './components/Historypanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/history" element={<HistoryPanel history={[]} onClose={() => {}} onClear={() => {}} onSelectCalculation={() => {}} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import Platform from './pages/platformPage/platform';

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Homepage />} />
      <Route path="/platform/*" element={<Platform />} />
    </Routes>
  );
}

export default App;
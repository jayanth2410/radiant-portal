import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import BrowserRouter
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<h1>Profile Page</h1>} />
          <Route path="/certifications" element={<h1>Certifications Page</h1>} />
          <Route path="/projects" element={<h1>Projects Page</h1>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

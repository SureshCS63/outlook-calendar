import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarApp from './CalendarApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalendarApp />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExcelDropZone from './Components/ExcelDropZone';
import Navbar from './Components/Navbar';
import ScatterPlotPage from './Components/ScatterPlot';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar title = "Excel File Analysis" />
        <Routes>
          <Route path="/" element={<ExcelDropZone />} />
          <Route path="/scatter-plot" element={<ScatterPlotPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

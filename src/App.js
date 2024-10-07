import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Films from './pages/Films_p';
import Customers from './pages/Customer';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/Film" element={<Films/>} /> 
        <Route path="/Customer" element={<Customers/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

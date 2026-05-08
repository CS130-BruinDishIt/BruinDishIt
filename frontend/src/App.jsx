import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Bplate from './pages/Bplate'
import Deneve from  './pages/Deneve'
import Epicuria from  './pages/Epicuria'
import Feast from  './pages/Feast'
import Bcafe from  './pages/Bcafe'
import Rende from  './pages/Rende'
import Drey from  './pages/Drey'
import Cafe1919 from  './pages/Cafe1919'
import Study from  './pages/Study'
import Ft from  './pages/Ft'

function App() {
  function Home() {
    const navigate = useNavigate();

    return (
      <div>
          <button className="big circle bplate" onClick={() => navigate("/bplate")}>
            BPLATE</button>
          <button className="big circle deneve" onClick={() => navigate("/de-neve")}>
            DE NEVE</button>
          <button className="big circle epicuria" onClick={() => navigate("/epicuria")}> 
            EPICURIA</button>
          <button className="med circle feast" onClick={() => navigate("/feast")}>
            FEAST</button>
          <button className="med circle bcafe" onClick={() => navigate("/bcafe")}>
            BCAFE</button>
          <button className="med circle rende" onClick={() => navigate("/rende")}>
            RENDE</button>
          <button className="med circle drey" onClick={() => navigate("/drey")}>
            DREY</button>
          <button className="med circle cafe1919" onClick={() => navigate("/cafe-1919")}>
            CAFE 1919</button>
          <button className="med circle study" onClick={() => navigate("/study")}>
            STUDY</button>
          <button className="small circle ft" onClick={() => navigate("/ft")}>
            FT</button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bplate" element={<Bplate />} />
        <Route path="/de-neve" element={<Deneve />} />
        <Route path="/epicuria" element={<Epicuria />} />
        <Route path="/feast" element={<Feast />} />
        <Route path="/bcafe" element={<Bcafe />} />
        <Route path="/rende" element={<Rende />} />
        <Route path="/drey" element={<Drey />} />
        <Route path="/cafe-1919" element={<Cafe1919 />} />
        <Route path="/study" element={<Study />} />
        <Route path="/ft" element={<Ft />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import Navbar from './Navbar.jsx'
import Login from './Login.jsx'
import './App.css'
import {Route, Routes} from 'react-router'

function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    </>
  )
}

function Home() {
  return (
    <>
      <div className="ticks"></div>
      <section className="circle-layout">
          <button className="big circle bplate"> BPLATE</button>
          <button className="big circle deneve"> DE NEVE</button>
          <button className="big circle epicuria"> EPICURIA</button>
          <button className="med circle feast"> FEAST</button>
          <button className="med circle bcafe"> BCAFE</button>
          <button className="med circle rende"> RENDE</button>
          <button className="med circle drey"> DREY</button>
          <button className="med circle cafe1919"> CAFE 1919</button>
          <button className="med circle study"> STUDY</button>
          <button className="small circle ft"> FT</button>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}
export default App

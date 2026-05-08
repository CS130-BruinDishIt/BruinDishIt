import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="ticks"></div>
        <section className="circle-layout">
          <button class="big circle bplate"> BPLATE</button>
          <button class="big circle deneve"> DE NEVE</button>
          <button class="big circle epicuria"> EPICURIA</button>
          <button class="med circle feast"> FEAST</button>
          <button class="med circle bcafe"> BCAFE</button>
          <button class="med circle rende"> RENDE</button>
          <button class="med circle drey"> DREY</button>
          <button class="med circle cafe1919"> CAFE 1919</button>
          <button class="med circle study"> STUDY</button>
          <button class="small circle ft"> FT</button>
        </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App

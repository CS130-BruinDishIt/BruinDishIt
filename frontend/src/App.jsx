import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import './App.css'

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { diningLocations } from './data/diningLocations.js'
import DiningPage from './pages/DiningPage'

function App() {

  function Home() {
    const navigate = useNavigate();

    return (
      <div>
      {diningLocations.map((place) => (
        <button 
          className={`${place.level} circle ${place.id}`}
          onClick={() => navigate(`/dining/${place.id}`)}
        >
          {place.shortname}
        </button>
      ))}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dining/:name" element={<DiningPage />} />
      </Routes>
    </>
  )
}
export default App

import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { diningLocations } from './data/diningLocations.js'
import DiningPage from './DiningPage'
import './styles/App.css'
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

function App() {

  function Home() {
    const navigate = useNavigate();

    return (
      <Container maxWidth={false} disableGutters className="app-container">
        {diningLocations.map((place) => (
          <Button key={place.id} variant="contained" disableElevation disableRipple
            className={`circle-button ${place.level} ${place.id}`}
            onClick={() => navigate(`/dining/${place.id}`)}
          >{place.shortname}</Button>
        ))}
      </Container>
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

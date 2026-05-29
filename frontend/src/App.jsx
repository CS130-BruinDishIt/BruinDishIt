import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDiningHalls } from "./api/dining";
import DiningPage from './DiningPage'
import DiningItemsPage from './DiningItemsPage'
import './styles/App.css'
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

function Home() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    fetchDiningHalls()
      .then((data) => setHalls(data.halls || []))
      .catch((error) => console.error("Error fetching dining halls:", error));
  }, []);

  return (
    <Container maxWidth={false} disableGutters className="app-container">
      {halls.map((place) => (
        <Button key={place.slug} variant="contained" disableElevation disableRipple
          className={`circle-button ${place.level} ${place.slug}`}
          onClick={() => navigate(`/dining/${place.slug}`)}
        >{place.shortName}</Button>
      ))}
    </Container>
  );
}

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dining/:name" element={<DiningPage />} />
        <Route path="/dining/:name/items" element={<DiningItemsPage />} />
      </Routes>
    </>
  )
}
export default App

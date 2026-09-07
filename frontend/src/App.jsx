import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import DiningPage from './DiningPage'
import DiningItemsPage from './DiningItemsPage'
import UserProfile from './UserProfile.jsx'
import SessionExpiredPopup from './components/SessionExpiredPopup.jsx'

import { fetchDiningHalls } from './api/dining.js'
import './styles/App.css'

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

function Home() {
  const navigate = useNavigate();
  const [diningHalls, setDiningHalls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchDiningHalls({ signal: controller.signal })
      .then((data) => setDiningHalls(data.halls || []))
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load dining halls.");
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="app-wrapper" >
      <div className="app-container" >
        <div className="bubble-wrapper">
          {error && <Typography className="home-status" color="error">{error}</Typography>}
          {!error && diningHalls.length === 0 && (
            <Typography className="home-status">Loading dining halls...</Typography>
          )}
          {diningHalls.map((hall, index) => (
            <Button
              key={hall.slug}
              variant="contained"
              className={`circle-button ${hall.slug} ${hall.level}`}
              onClick={() => navigate(`/dining/${hall.slug}`)}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <span>{hall.shortName}</span>
              <small>{hall.totalReviewCount || 0} reviews</small>
            </Button>
          ))}
        </div>
      </div >
    </div>
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
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
      <SessionExpiredPopup />
    </>
  )
}
export default App

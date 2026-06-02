import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import DiningPage from './DiningPage'
import DiningItemsPage from './DiningItemsPage'
import UserProfile from './UserProfile.jsx'

import { diningLocations } from './data/diningLocations.js'
import './styles/App.css'

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

function Home() {
  const navigate = useNavigate();

  return (
    <div maxWidth={false} className="app-container" disableGutters >
      <div className="bubble-wrapper">
        {diningLocations.map((place, index) => (
          <Button
            key={place.id}
            variant="contained"
            className={`circle-button ${place.id} ${place.level}`}
            onClick={() => navigate(`/dining/${place.id}`)}
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {place.shortname}
          </Button>
        ))}
      </div>
    </div >
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
    </>
  )
}
export default App

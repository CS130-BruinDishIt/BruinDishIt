import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from './Navbar.jsx'
import SignIn from './SignIn.jsx'
import SignUp from './SignUp.jsx'
import DiningPage from './DiningPage'
import DiningItemsPage from './DiningItemsPage'
import UserProfile from './UserProfile.jsx'
import SessionExpiredPopup from './components/SessionExpiredPopup.jsx'
import RatingBox from './components/RatingBox.jsx'
import ViewListIcon from '@mui/icons-material/ViewList';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

import { fetchDiningHalls } from './api/dining.js'
import './styles/App.css'

import {
  Box,
  Button,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

function getReviewSizeByHall(diningHalls, sizeMetric) {
  const rankedHalls = getHallsByMetric(diningHalls, sizeMetric);

  return new Map(
    rankedHalls.map((hall, index) => [
      hall.slug,
      index < 4 ? "large" : index < 8 ? "med" : "small",
    ])
  );
}

function getHallsByMetric(diningHalls, sizeMetric) {
  return [...diningHalls].sort((firstHall, secondHall) => {
    const metricDifference = sizeMetric === "rating"
      ? (secondHall.averageRating || 0) - (firstHall.averageRating || 0)
      : (secondHall.totalReviewCount || 0) - (firstHall.totalReviewCount || 0);

    return metricDifference
      || (secondHall.totalReviewCount || 0) - (firstHall.totalReviewCount || 0)
      || firstHall.slug.localeCompare(secondHall.slug);
  });
}

function Home() {
  const navigate = useNavigate();
  const [diningHalls, setDiningHalls] = useState([]);
  const [error, setError] = useState("");
  const [sizeMetric, setSizeMetric] = useState("reviews");
  const [layoutMode, setLayoutMode] = useState("circles");

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

  const reviewSizeByHall = getReviewSizeByHall(diningHalls, sizeMetric);
  const displayedHalls = layoutMode === "list"
    ? getHallsByMetric(diningHalls, sizeMetric)
    : diningHalls;

  return (
    <div className="app-wrapper" >
      <div className="home-controls">
        <ToggleButtonGroup
          className="size-metric-switch"
          value={sizeMetric}
          exclusive
          onChange={(_, nextMetric) => {
            if (nextMetric) setSizeMetric(nextMetric);
          }}
          size="small"
          aria-label="Circle size metric"
          color="info"
        >
          <ToggleButton value="reviews" aria-label="Size by review count">
            Reviews
          </ToggleButton>
          <ToggleButton value="rating" aria-label="Size by average rating">
            Rating
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip
          title={layoutMode === "circles" ? "Switch to list view" : "Switch to circle view"}
        >
          <IconButton
            className="layout-switch"
            onClick={() => setLayoutMode((currentMode) => (
              currentMode === "circles" ? "list" : "circles"
            ))}
            aria-label={layoutMode === "circles" ? "Switch to list view" : "Switch to circle view"}
          >
            {layoutMode === "circles" ? <ViewListIcon /> : <WorkspacesIcon />}
          </IconButton>
        </Tooltip>
      </div>
      <div className={`app-container ${layoutMode === "list" ? "list-layout" : ""}`}>
        <div className={layoutMode === "list" ? "hall-list" : "bubble-wrapper"}>
          {error && <Typography className="home-status" color="error">{error}</Typography>}
          {!error && diningHalls.length === 0 && (
            <Typography className="home-status">Loading dining halls...</Typography>
          )}
          {layoutMode === "list"
            ? displayedHalls.map((hall) => (
              <Button
                key={hall.slug}
                className="hall-list-item"
                onClick={() => navigate(`/dining/${hall.slug}`)}
              >
                <span className="hall-list-name">{hall.name}</span>
                <span className="hall-list-details">
                  <RatingBox rating={hall.averageRating} />
                  <span>{hall.totalReviewCount || 0} reviews</span>
                </span>
              </Button>
            ))
            : diningHalls.map((hall, index) => (
              <Button
                key={hall.slug}
                variant="contained"
                className={`circle-button ${hall.slug} ${reviewSizeByHall.get(hall.slug)}`}
                onClick={() => navigate(`/dining/${hall.slug}`)}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <span>{hall.shortName}</span>
                <small>{hall.totalReviewCount || 0} reviews</small>
                <RatingBox rating={hall.averageRating} />
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

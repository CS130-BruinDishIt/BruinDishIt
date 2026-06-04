import { fetchDailyMenu } from "./api/dining";
import { fetchDiningHall } from "./api/dining";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./styles/DiningPage.css";
import { MEALS } from "./data/mealLabels"

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import CommentDrawer from "./CommentDrawer";

import BackToTop from "./components/BackToTop";
import RatingBox from "./components/RatingBox";

const DiningPage = () => {

  // Identify dining location being fetched
  const { name } = useParams();
  const navigate = useNavigate();

  // Track request lifecycle to handle async loading and error states cleanly.
  const [hall, setHall] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Track if reviews are being viewed for any menu item currently
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPacificTime, setCurrentPacificTime] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "full",
      timeStyle: "medium",
      hour12: true,
    }).format(new Date())
  );

  const openComments = ({ id, name, type = "items", averageRating }) => {
    setSelectedItem({ id, name, type, averageRating });
    setDrawerOpen(true);

    const key = encodeURIComponent(`${id}`);
    window.history.replaceState(null, "", `${window.location.pathname}#${key}`);
  };

  const closeComments = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  useEffect(() => {
    if (!name) return;
    fetchDiningHall(name)
      .then((data) => setHall(data))
      .catch((error) => console.error("Error fetching dining hall:", error));
  }, [name]);

  // Show current date and time in Pacific timezone, updating every second
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "full",
      timeStyle: "medium",
      hour12: true,
    });

    const updateTime = () => {
      setCurrentPacificTime(formatter.format(new Date()));
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Fetch latest data from database
  useEffect(() => {
    if (!name) return;

    // Cancel in-flight requests when the route changes to prevent stale updates.
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage("");

    fetchDailyMenu(name, { signal: controller.signal })
      .then((data) => {
        setMenuData(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setErrorMessage(error?.message || "Menu unavailable.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [name]);

  // Normalize menu data for render without recalculating on every render.
  const meals = useMemo(() => menuData?.meals || [], [menuData]);
  const isLoading = status === "loading" || status === "idle";

  // Generate custom URL + jump to for each menu section
  const mealRefs = useRef({});
  const scrollToMeal = (mealType) => {
    mealRefs.current[mealType]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Generate custom URL for each menu item's review section
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id || !meals.length) return;

    const found = meals
      .flatMap(m => m.stations)
      .flatMap(s => s.items)
      .find(i => encodeURIComponent(i.id) === id);

    if (found) {
      setSelectedItem(found);
      setDrawerOpen(true);
    }
  }, [meals]);

  // Handle different display responses
  if (isLoading) {
    return (
      <Container maxWidth="lg" className="dining-container">
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h4">Loading menu...</Typography>
        </Container>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container maxWidth="lg" className="dining-container">
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h4">Dining hall "{name}" was not found.</Typography>
        </Container>
      </Container>
    );
  }

  if (!meals.length) {
    return (
      <Container maxWidth="lg" className="dining-container">
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography variant="h4">Menus unavailable for "{name}."</Typography>
        </Container>
      </Container>
    );
  }

  return (
    <>
      <Container className="dining-container">

        {/* Title */}
        <Box
          className="location-box"
          sx={{
            position: "relative",
            overflow: "hidden",
            mb: 4,
            p: 3.5,
            borderRadius: "0 0 15px 15px",
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.06)",
            backdropFilter: "blur(12px)",

            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 4,
              backgroundColor: "#1976d2",
            },
          }}
        >
          <Box className="location-header">
            <Box sx={{ width: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} className="location-title-row">
                <Typography variant="h3" className="location-title">
                  {hall?.name || name}
                </Typography>
              </Stack>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                {currentPacificTime}
              </Typography>
            </Stack>
            <Box
              sx={{
                width:"100%",
                height: "1px",
                backgroundColor: "rgba(0,0,0,0.08)",
              }}
            >
            </Box>


            <Stack
              direction="row"
              spacing={2}
              alignItems="stretch"
            >
              {/* Left Column */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 3,
                  backgroundColor: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 160,
                  paddingBottom: "20px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.75,
                  }}
                >
                  Overall Rating
                </Typography>

                <RatingBox
                  rating={hall?.averageRating}
                  size="large"
                />
              </Box>

              {/* Right Column */}
              <Stack
                spacing={1.25}
                justifyContent="center"
              >
                <Button
                  variant="outlined"
                  startIcon={<ModeCommentOutlinedIcon />}
                  onClick={() =>
                    openComments({
                      id: hall?.id,
                      name: hall?.name || name,
                      type: "halls",
                      averageRating: hall?.averageRating,
                    })
                  }
                  className="pill pill--reviews"
                >
                  View Location Reviews
                </Button>

                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => navigate(`/dining/${name}/items`)}
                  className="pill pill--history"
                >
                  View All-Time Menu Items
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Jump To Section */}
        <Box
          sx={{
            mb: 5,
            display: "flex",
            alignItems: "center",
            gap: 2,

            px: 2,
            py: 1.5,

            borderBottom: "1px solid rgba(0,0,0,0.08)",

            ml: 4,
          }}
        >
          {/* TITLE */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: "text.primary",
            }}
          >
            Go To
          </Typography>

          <Box
            sx={{
              width: "1px",
              height: 20,
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
          />

          {meals.map(({ mealType }) => (
            <Button
              key={mealType}
              onClick={() => scrollToMeal(mealType)}
              disableElevation
              sx={{
                width: 180,

                textTransform: "none",
                fontWeight: 500,

                py: 0.75,
                px: 1.5,

                borderRadius: 5,

                color: "text.primary",
                backgroundColor: "transparent",

                justifyContent: "flex-start",

                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",

                border: `1px solid ${MEALS[mealType].color || "rgba(0,0,0,0.12)"}`,

                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              <span style={{ marginRight: 8, display: "inline-flex", alignItems: "center" }}>
                {MEALS[mealType].icon}
              </span>

              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.3px",
                }}
              >
                {MEALS[mealType].label || mealType}
              </span>
            </Button>
          ))}
        </Box>

        {/* Meals */}
        <Stack spacing={4}>

          {meals.map(({ mealType, stations }) => (
            <Paper
              key={mealType}
              ref={(el) => (mealRefs.current[mealType] = el)}
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
                scrollMarginTop: "100px",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {MEALS[mealType].label || mealType}
              </Typography>

              {/* Stations */}
              <Stack spacing={3}>
                {stations.map(({ stationName, items }) => (
                  <Card key={stationName} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {stationName}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      {/* Items */}
                      <Stack spacing={1}>
                        {items.map(({ id, name, averageRating }) => (
                          <Stack key={id} direction="row" alignItems="center" sx={{ py: 0.5 }}>

                            {/* Item Name */}
                            <Typography
                              component="button"
                              type="button"
                              variant="body1"
                              onClick={() => openComments({ id, name, type: "items", averageRating })}
                              sx={{
                                px: 1,
                                py: 0,
                                border: 0,
                                background: "transparent",
                                textAlign: "left",
                                cursor: "pointer",
                                color: "#1976d2",
                              }}
                            >
                              • {name}
                            </Typography>


                            {/* Button to view reviews */}
                            <IconButton onClick={() => openComments({ id, name, type: "items", averageRating })} className="review-btn" sx={{ ml: 1, flexShrink: 0 }}>
                              <ModeCommentOutlinedIcon fontSize="small" />
                            </IconButton>

                            {/* Average Rating Box */}
                            <RatingBox rating={averageRating} sx={{ ml: 1, alignSelf: "center" }} />
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container >

      {/* Review drawer overlay */}
      < Drawer anchor="bottom" open={drawerOpen} onClose={closeComments}
        slotProps={{
          paper: {
            sx: {
              height: "90vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflowX: "hidden",
            },
          },
        }
        }
      >
        <CommentDrawer item={selectedItem} />
      </Drawer >

      <BackToTop />
    </>
  )
}

export default DiningPage

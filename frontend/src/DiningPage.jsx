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
import StarIcon from "@mui/icons-material/Star";
import CommentDrawer from "./CommentDrawer";

import BackToTop from "./components/BackToTop";

const getRatingBoxStyle = (rating) => {
  const num = Number(rating);
  if (!num || num <= 0) return { bgcolor: 'grey.100', color: 'text.primary', borderColor: 'grey.300' };
  if (num < 2.0) return { bgcolor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' };
  if (num < 3.0) return { bgcolor: '#ed6c02', color: '#fff', borderColor: '#ed6c02' };
  if (num < 4.0) return { bgcolor: '#fbc02d', color: '#000', borderColor: '#fbc02d' };
  if (num < 4.6) return { bgcolor: '#4caf50', color: '#fff', borderColor: '#4caf50' };
  return { bgcolor: '#2e7d32', color: '#fff', borderColor: '#2e7d32' };
};

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
        <Box className="location-box">
          <Box className="location-header">
            <Box sx={{ width: "100%"}}>
            
              <Stack direction="row" alignItems="center" spacing={1.5} className="location-title-row">
                <Typography variant="h3" className="location-title">
                  {hall?.name || name}
                </Typography>
                <IconButton onClick={() => openComments({ id: hall?.id, name: hall?.name || name, type: 'halls', averageRating: hall?.averageRating })} className="review-btn">
                  <ModeCommentOutlinedIcon fontSize='medium' />
                </IconButton>



                {/* Average Rating Box */}
                <Box sx={{ ml: 'auto', px: 1.5, py: 0.5, borderRadius: 2, border: '2px solid', display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...getRatingBoxStyle(hall?.averageRating) }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'inherit' }}>
                    <Typography variant="h5" sx={{ color: 'inherit', fontWeight: 600, fontSize: '30px', lineHeight: 1 }}>{hall?.averageRating > 0 ? Number(hall.averageRating).toFixed(1) : "--"}</Typography>
                    <StarIcon sx={{ fontSize: '30px', color: 'inherit' }} />
                  </Stack>
                </Box>
              </Stack>
              
            </Box>

            <Typography variant="body2" className="pill pill--time">
              {currentPacificTime}
            </Typography>

            <Box>
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate(`/dining/${name}/items`)}
                className="pill pill--history"
              >
                View All-Time Menu Items
              </Button>
              <Button
                variant="outlined"
                startIcon={<ModeCommentOutlinedIcon />}
                onClick={() =>
                  openComments({ id: hall?.id, name: hall?.name || name, type: "halls", averageRating: hall?.averageRating })
                }
                className="pill pill--reviews"
              >
                View Location Reviews
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Jump To Section */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            width: "fit-content",
            display: "inline-block",
            ml: 4,
            mr: "auto",
            borderRadius: 0,
            boxShadow: "none",
            border: "1px solid rgba(0,0,0,0.12)",
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255,255,255,0.85)",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "row",   
              alignItems: "center",   
              gap: 2,
              p: 2,
              whiteSpace: "nowrap",
            }}
          >
            {/* TITLE */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Go To
            </Typography>
            <Box
              sx={{
                width: "1px",
                backgroundColor: "divider",
                mx: 1,
              }}
            />
            {meals.map(({ mealType }) => (
              <Button
                key={mealType}
                onClick={() => scrollToMeal(mealType)}
                sx={{
                  width: 200,
                  borderRadius: "999px",

                  textTransform: "none",
                  fontWeight: 600,

                  py: 1,
                  px: 2,

                  color: "#fff",
                  backgroundColor: MEALS[mealType].color || "#1976d2",

                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  transition: "all 0.2s ease",

                  "&:hover": {
                    backgroundColor: MEALS[mealType].color || "#1565c0",
                    transform: "scale(1.03)",
                  },
                }}
              >
                <span style={{ marginRight: 8 }}>
                  {MEALS[mealType].icon}
                </span>
                {MEALS[mealType].label || mealType}
              </Button>
            ))}

          </CardContent>
        </Card>

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
                            <Box sx={{ ml: 1, px: 0.75, py: 0.75, height: 'fit-content', alignSelf: 'center', borderRadius: 1, border: '1px solid', display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...getRatingBoxStyle(averageRating) }}>
                              <Stack direction="row" alignItems="center" spacing={0.25} sx={{ color: 'inherit' }}>
                                <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600, lineHeight: 1 }}>{averageRating > 0 ? Number(averageRating).toFixed(1) : "--"}</Typography>
                                <StarIcon sx={{ fontSize: '14px', color: 'inherit' }} />
                              </Stack>
                            </Box>
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
      </Container>

      {/* Review drawer overlay */}
      <Drawer anchor="bottom" open={drawerOpen} onClose={closeComments}
        slotProps={{
          paper: {
            sx: {
              height: "90vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflowX: "hidden",
            },
          },
        }}
      >
        <CommentDrawer item={selectedItem} />
      </Drawer>

      <BackToTop />
    </>
  )
}

export default DiningPage

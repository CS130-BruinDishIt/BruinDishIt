import { fetchDailyMenu } from "./api/dining";
import { fetchDiningHall } from "./api/dining";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles/DiningPage.css";
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
import PageToc from "./PageToc";

// Map backend meal keys to friendly labels for display
const MEAL_LABELS = {
  "allday": "All Day",
  "breakfast": "Breakfast",
  "lunch": "Lunch",
  "dinner": "Dinner",
  "extended dinner": "Extended Dinner",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

  const openComments = ({ id, name, type = "items" }) => {
    setSelectedItem({ id, name, type});
    setDrawerOpen(true);
        console.log(type)

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

  const tocItems = useMemo(
    () =>
      meals.flatMap((meal, mealIndex) => {
        const mealLabel = MEAL_LABELS[meal.mealType] || meal.mealType;
        const mealId = `meal-${mealIndex}-${slugify(meal.mealType)}`;

        const stationItems = (meal.stations || []).map((station, stationIndex) => ({
          id: `station-${mealIndex}-${stationIndex}-${slugify(meal.mealType)}-${slugify(station.stationName)}`,
          label: station.stationName,
          level: 2,
        }));

        return [{ id: mealId, label: mealLabel, level: 1 }, ...stationItems];
      }),
    [meals]
  );

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
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">Loading menu...</Typography>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">Dining hall "{name}" was not found.</Typography>
      </Container>
    );
  }

  if (!meals.length) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">Menus unavailable for "{name}."</Typography>
      </Container>
    );
  }

  return (
    <>
      <PageToc items={tocItems} label="STATIONS" />

      <Container maxWidth="lg" className="dining-container">
        <Box className="location-box">
          <Box className="location-header">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} className="location-title-row">
                <Typography variant="h3" className="location-title">
                  {hall?.name || name}
                </Typography>
                <IconButton onClick={() => openComments({ id: hall?.id, name: hall?.name || name, type: 'halls' })} className="review-btn">
                  <ModeCommentOutlinedIcon fontSize='medium' />
                </IconButton>
              </Stack>
              <Typography variant="body2" className="location-datetime">
                {currentPacificTime}
              </Typography>
            </Box>

            <Button variant="contained" disableElevation onClick={() => navigate(`/dining/${name}/items`)}>
              View All Time Menu Items
            </Button>
          </Box>

          {hall?.description && (
            <Typography variant="body1" color="text.secondary">
              {hall.description}
            </Typography>
          )}

        </Box>

        <Stack spacing={4}>
          {/* Meals */}
          {meals.map(({ mealType, stations }, mealIndex) => {
            const mealId = `meal-${mealIndex}-${slugify(mealType)}`;

            return (
              <Paper key={mealType} elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography
                  id={mealId}
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 3, scrollMarginTop: 96 }}
                >
                  {MEAL_LABELS[mealType] || mealType}
                </Typography>

                {/* Stations */}
                <Stack spacing={3}>
                  {stations.map(({ stationName, items }, stationIndex) => {
                    const stationId = `station-${mealIndex}-${stationIndex}-${slugify(mealType)}-${slugify(stationName)}`;

                    return (
                      <Card key={stationName} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Typography
                            id={stationId}
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2, scrollMarginTop: 96 }}
                          >
                            {stationName}
                          </Typography>

                          <Divider sx={{ mb: 2 }} />

                          {/* Items */}
                          <Stack spacing={1}>
                            {items.map(({ id, name }) => (
                              <Stack key={id} direction="row" sx={{ py: 0.5 }}>
                                <Typography
                                  component="button"
                                  type="button"
                                  variant="body1"
                                  onClick={() => openComments({ id, name, type: "items" })}
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

                                <IconButton onClick={() => openComments({ id, name, type: "items" })} className="review-btn">
                                  <ModeCommentOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Paper>
            );
          })}
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
    </>
  )
}

export default DiningPage

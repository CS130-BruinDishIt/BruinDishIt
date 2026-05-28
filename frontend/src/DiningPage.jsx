import { fetchDailyMenu } from "./api/dining";
import { diningLocations } from "./data/diningLocations";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

// Map backend meal keys to friendly labels for display
const MEAL_LABELS = {
  "allday": "All Day",
  "breakfast": "Breakfast",
  "lunch": "Lunch",
  "dinner": "Dinner",
  "extended dinner": "Extended Dinner",
};

const DiningPage = () => {
  // Identify dining location being fetched
  const { name } = useParams();
  const loc = diningLocations.find(u => u.id === name);

  // Track request lifecycle to handle async loading and error states cleanly.
  const [menuData, setMenuData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Track if reviews are being viewed for any menu item currently
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openComments = ({ id, name }) => {
    setSelectedItem({ id, name });
    setDrawerOpen(true);
    const key = encodeURIComponent(`${id}`);
    window.history.replaceState(null, "", `${window.location.pathname}#${key}`);
  };

  const closeComments = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

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
      <Container maxWidth="lg" className="dining-container">
        <Box className="location-box">
          <Typography variant="h3" className="location-title">
            {loc?.name}
          </Typography>

          {loc?.description && (
            <Typography variant="body1" color="text.secondary">
              {loc.description}
            </Typography>
          )}
        </Box>

        <Stack spacing={4}>
          {/* Meals */}
          {meals.map(({ mealType, stations }) => (
            <Paper key={mealType} elevation={3} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {MEAL_LABELS[mealType] || mealType}
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
                        {items.map(({ id, name }) => (
                          <Stack key={id} direction="row" sx={{ py: 0.5 }}>
                            
                            {/* Item Name */}
                            <Typography variant="body1" sx={{ px: 1, py: 0 }}>
                              • {name}
                            </Typography>

                            {/* Button to view reviews */}
                            <IconButton onClick={() => openComments({ id, name })} className="review-btn" >
                              <ModeCommentOutlinedIcon fontSize="small" />
                            </IconButton>
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

import { fetchDailyMenu } from "./api/dining";
import { diningLocations } from "./data/diningLocations";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/DiningPage.css";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

// Map backend meal keys to friendly labels for display.
const MEAL_LABELS = {
  "allday": "All Day",
  "breakfast": "Breakfast",
  "lunch": "Lunch",
  "dinner": "Dinner",
  "extended dinner": "Extended Dinner",
};

const DiningPage = () => {
  const { name } = useParams();
  const loc = diningLocations.find(u => u.id === name);

  // Track request lifecycle to handle async loading and error states cleanly.
  const [menuData, setMenuData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
          {meals.map(({ mealType, stations }) => (
            <Paper key={mealType} elevation={3} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {MEAL_LABELS[mealType] || mealType}
              </Typography>

              <Stack spacing={3}>
                {stations.map(({ stationName, items }) => (
                  <Card key={stationName} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {stationName}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Stack spacing={1}>
                        {items.map(({id, name}) => (
                          <Typography key={id || name} variant="body1" >
                            • {name}
                          </Typography>
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
    </>
  )
}

export default DiningPage

import menuData from "../../scraper/dining_data.json";
import { diningLocations } from "./data/diningLocations";
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

const DiningPage = () => {
  const { name } = useParams();
  const loc = diningLocations.find(u => u.id === name);

  const hallMenu = menuData?.[name];
  if (!hallMenu) {
    return <Container maxWidth="md" sx={{ py: 6 }}>
              <Typography variant="h4">Data unavailable for "{name}"</Typography>
            </Container>;
  }

  let mealMenus = {
    "All Day": hallMenu?.["allday"],
    "Breakfast": hallMenu?.["breakfast"],
    "Lunch": hallMenu?.["lunch"],
    "Dinner": hallMenu?.["dinner"],
    "Extended Dinner": hallMenu?.["extended dinner"],
  }

  for (const key in mealMenus) {
    if (!mealMenus[key]) {
      delete mealMenus[key];
    }
    if (Object.keys(mealMenus).length === 0) {
      return <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h4">Menus unavailable for "{name}"</Typography>
              </Container>;
    }
  }

  return (
    <>
      <Container maxWidth="lg" className="dining-container">
        <Box className="location-box">
          <Typography variant="h3" className="location-title"
          >{loc?.name}</Typography>

          {loc?.description && (
            <Typography variant="body1" color="text.secondary">
              {loc.description}
            </Typography>
          )}
        </Box>

        <Stack spacing={4}>
          {Object.entries(mealMenus).map(([mealName, mealData]) => (
            <Paper
              key={mealName}
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                {mealName}
              </Typography>

              {mealData.hours && (
                <Chip
                  label={`Hours: ${mealData.hours}`}
                  sx={{ mb: 3 }}
                />
              )}

              <Stack spacing={3}>
                {Object.entries(mealData)
                  .filter(([key]) => key !== "hours")
                  .map(([category, items]) => (
                    <Card
                      key={category}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          {category}
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={1}>
                          {items.map((item, index) => (
                            <Typography
                              key={index}
                              variant="body1"
                            >
                              • {item}
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

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAllMenuItems } from "./api/dining";
import { fetchDiningHall } from "./api/dining";
import "./styles/DiningPage.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import PacificClock from "./components/PacificClock";

import BackToTop from "./components/BackToTop";
import CommentDrawer from "./CommentDrawer";
import RatingBox from "./components/RatingBox"

const DiningItemsPage = () => {
  const { name } = useParams();

  const [hall, setHall] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openComments = ({ id, name, type = "items", averageRating, lastSeen = null }) => {
    setSelectedItem({ id, name, type, averageRating, lastSeen });
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

  useEffect(() => {
    if (!name) return;

    const controller = new AbortController();

    setStatus("loading");
    setErrorMessage("");

    fetchAllMenuItems(name, { signal: controller.signal })
      .then((data) => {
        setItems(data.items || []);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setErrorMessage(error?.message || "Menu items unavailable.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [name]);

  const groupedItems = useMemo(() => {
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

    return sortedItems.reduce((groups, item) => {
      const letter = item.name.charAt(0).toUpperCase();

      if (!groups[letter]) {
        groups[letter] = [];
      }

      groups[letter].push(item);
      return groups;
    }, {});
  }, [items]);

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id || !items.length) return;

    const found = items.find((item) => encodeURIComponent(item.id) === id);

    if (found) {
      setSelectedItem(found);
      setDrawerOpen(true);
    }
  }, [items]);

  const isLoading = status === "loading" || status === "idle";

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">Loading menu items...</Typography>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">Menu items could not be loaded.</Typography>
        {errorMessage && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {errorMessage}
          </Typography>
        )}
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4">No menu items found.</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container className="dining-container">
        <Box
          className="location-box"
          sx={{
            position: "relative",
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
              <Stack direction="row" spacing={1.5} className="location-title-row">
                <Typography variant="h3" className="location-title">
                  {hall?.name || name}
                </Typography>
              </Stack>
            </Box>
            <Stack
              direction="row"
              spacing={1}
            >
              <PacificClock />
            </Stack>
            <Box
              sx={{
                width: "100%",
                height: "1px",
                backgroundColor: "rgba(0,0,0,0.08)",
              }}
            >
            </Box>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Rating */}
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

              {/* Location Reviews and All-Time Menu Buttons */}
              <Stack
                spacing={1.25}
                className="pills-stack"
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
                  component={Link}
                  to={`/dining/${name}`}
                  variant="contained"
                  disableElevation
                  className="pill pill--history"
                  sx={{ width: 'fit-content' }}
                >
                  Back to Today
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Paper elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            "@media (max-width: 700px)": {
              p: 0,
            },
          }}>
          <Typography variant="h4" sx={{ fontWeight: 700, p: 3 }}>
            All Menu Items
          </Typography>

          <Stack spacing={1}>
            {Object.entries(groupedItems).map(([letter, letterItems]) => (
              <Card key={letter} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, ml: 1 }}>
                    {letter}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {letterItems.map(({ id, name, lastSeen, dateAdded, averageRating }) => (
                      <Stack key={id} direction="row" sx={{ py: 0.75, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                        {/* Item Name */}
                        <Typography
                          component="button"
                          type="button"
                          variant="body1"
                          onClick={() => openComments({ id, name, type: "items", averageRating, lastSeen })}
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
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          "@media (max-width: 700px)": {
                            ml: "auto"
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: .5, lineHeight: 1, alignSelf: "center" }}>
                            Last served: {new Date(lastSeen ?? dateAdded).toLocaleDateString()}
                          </Typography>
                          <IconButton onClick={() => openComments({ id, name, type: "items", averageRating, lastSeen })} className="review-btn" sx={{ ml: 1, flexShrink: 0 }}>
                            <ModeCommentOutlinedIcon fontSize="small" />
                          </IconButton>
                          {/* Average Rating Box */}
                          <RatingBox rating={averageRating} sx={{ ml: 1, alignSelf: "center" }} />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Container>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={closeComments}
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
  );
};

export default DiningItemsPage;
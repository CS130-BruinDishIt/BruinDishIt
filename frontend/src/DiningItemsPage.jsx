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
import StarIcon from "@mui/icons-material/Star";
import BackToTop from "./components/BackToTop";
import CommentDrawer from "./CommentDrawer";

const getRatingBoxStyle = (rating) => {
  const num = Number(rating);
  if (!num || num <= 0) return { bgcolor: 'grey.100', color: 'text.primary', borderColor: 'grey.300' };
  if (num < 2.0) return { bgcolor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' };
  if (num < 3.0) return { bgcolor: '#ed6c02', color: '#fff', borderColor: '#ed6c02' };
  if (num < 4.0) return { bgcolor: '#fbc02d', color: '#000', borderColor: '#fbc02d' };
  if (num < 4.6) return { bgcolor: '#4caf50', color: '#fff', borderColor: '#4caf50' };
  return { bgcolor: '#2e7d32', color: '#fff', borderColor: '#2e7d32' };
};

const DiningItemsPage = () => {
  const { name } = useParams();

  const [hall, setHall] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <Container maxWidth="lg" className="dining-container">
        <Box className="location-box">
          <Stack direction="column" alignItems="flex-start" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h3" className="location-title">
                {hall?.name || name}
              </Typography>
              <IconButton onClick={() => openComments({ id: hall?.id, name: hall?.name || name, type: 'halls', averageRating: hall?.averageRating })} className="review-btn">
                <ModeCommentOutlinedIcon fontSize='medium' />
              </IconButton>
            </Stack>

            <Typography variant="body1" color="text.secondary" sx={{pl: 1.5}}>
              Browse every menu item served at this dining hall.
            </Typography>

            <Button
              component={Link}
              to={`/dining/${name}`}
              variant="contained"
              disableElevation
              className="pill pill--history"
              sx={{ width: 'fit-content'}}
            >
              Back to Today
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            All Menu Items
          </Typography>

          <Stack spacing={3}>
            {Object.entries(groupedItems).map(([letter, letterItems]) => (
              <Card key={letter} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {letter}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {letterItems.map(({ id, name, lastSeen, dateAdded, averageRating }) => (
                      <Stack key={id} direction="row" alignItems="center" sx={{ py: 0.75 }}>
                        <Stack direction="row" alignItems="baseline">
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

                          <Typography variant="caption" color="text.secondary" sx={{ ml: .5, whiteSpace: "nowrap", lineHeight: 1 , alignSelf: "center"}}>
                            Last served: {new Date(lastSeen ?? dateAdded).toLocaleDateString()}
                          </Typography>
                        </Stack>

                        {/* Button to view reviews */}
                        <IconButton onClick={() => openComments({ id, name, type: "items", averageRating })} className="review-btn" sx={{ ml: 1, flexShrink: 0 }}>
                          <ModeCommentOutlinedIcon fontSize="small" />
                        </IconButton>

                        {/* Average Rating Box */}
                        <Box sx={{ ml: 1, px: 0.75, py: 0.75, height: 'fit-content', alignSelf: 'center', borderRadius: 1, border: '1px solid', display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...getRatingBoxStyle(averageRating) }}>
                          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ color: 'inherit' }}>
                            <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600, lineHeight: 1 }}>{averageRating > 0 ? Number(averageRating).toFixed(1) : "--"}</Typography>
                            <StarIcon sx={{ fontSize: '0.875rem', color: 'inherit' }} />
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
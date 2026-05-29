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
import CommentDrawer from "./CommentDrawer";

const DiningItemsPage = () => {
  const { name } = useParams();

  const [hall, setHall] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openComments = ({ id, name, type = "items" }) => {
    setSelectedItem({ id, name, type });
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
          <Stack direction="row" alignitems="center" spacing={2}>
            <Typography variant="h3" className="location-title">
              {hall?.name || name}
            </Typography>
            <IconButton onClick={() => openComments({ id: hall?.id, name: hall?.name || name, type: 'halls' })} className="review-btn">
              <ModeCommentOutlinedIcon fontSize='medium' />
            </IconButton>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            Browse every menu item served at this dining hall.
          </Typography>

          <Button
            component={Link}
            to={`/dining/${name}`}
            variant="contained"
            disableElevation
            sx={{ mt: 2 }}
          >
            Back to Today
          </Button>
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
                    {letterItems.map(({ id, name, lastSeen, dateAdded }) => (
                      <Stack key={id} direction="row" sx={{ py: 0.75 }}>
                        {/* Item Name */}
                        <Typography variant="body1" sx={{ px: 1, py: 0 }}>
                          • {name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ ml: .5, whiteSpace: "nowrap", lineHeight: 1, position: "relative", top: "6px" }}>
                          Last served: {new Date(lastSeen ?? dateAdded).toLocaleDateString()}
                        </Typography>

                        {/* Button to view reviews */}
                        <IconButton onClick={() => openComments({ id, name, type: "items" })} className="review-btn" sx={{ ml: 1 }}>
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
            },
          },
        }}
      >
        <CommentDrawer item={selectedItem} />
      </Drawer>
    </>
  );
};

export default DiningItemsPage;
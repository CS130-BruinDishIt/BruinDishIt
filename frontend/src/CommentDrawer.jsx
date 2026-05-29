import { useEffect, useState } from "react";
import { fetchItemReviews } from "./api/dining";

import {
  Box,
  Typography,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short', // options: 'full', 'long', 'medium', 'short'
  timeStyle: 'short'
});

// Support absolute URLs and legacy local asset names.
// Support both hosted URLs and legacy local asset filenames.
const resolvePhotoSrc = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `/src/assets/${value}`;
};

const CommentDrawer = ({ item }) => {
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);

  // Load reviews from the backend whenever the selected item changes.
  // Load reviews and gallery data from the backend for the selected item.
  useEffect(() => {
    if (!item?.id) return;
    const controller = new AbortController();
    setReviews([]);
    setPhotos([]);

    fetchItemReviews(item.id, { signal: controller.signal })
      .then((data) => {
        // Sort newest-first to match the prior placeholder behavior.
        const sortedReviews = [...(data?.reviews || [])].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const sortedPhotos = [...(data?.photos || [])].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setReviews(sortedReviews);
        setPhotos(sortedPhotos);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setReviews([]);
        setPhotos([]);
      });

    return () => controller.abort();
  }, [item]);

  if (!item) return null;

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3, overflowY: "auto" }}>

      <Typography variant="h6">{item.name}</Typography>

      <Typography variant="caption" color="text.secondary">
        ID: {item.id}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {photos.length > 0 && (
        <>
          <Typography
            variant="h6"
            sx={{ mt: 2, mb: 1, fontWeight: 600 }}
          >
            Gallery
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: "auto",
              pb: 1,
            }}
          >
            {photos.map((photo, idx) => (
              <Box
                key={idx}
                sx={{
                  minWidth: 140,
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={resolvePhotoSrc(photo.path || photo.url || photo)}
                  alt={photo.path}
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      {reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        reviews.map((r, i) => {
          // Support legacy arrays and new numeric counts for reactions.
          const likeCount = Array.isArray(r.likes) ? r.likes.length : (r.likes || 0);
          const dislikeCount = Array.isArray(r.dislikes) ? r.dislikes.length : (r.dislikes || 0);
          return (
            <Box key={i} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                User {r.userID || r.user}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatter.format(new Date(r.date))}
              </Typography>

              <Typography sx={{ mt: 0.5 }}>
                {r.review}
              </Typography>

              {r.photos?.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 2,
                    overflowX: "auto",
                  }}
                >
                  {r.photos.map((photo, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={resolvePhotoSrc(photo)}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </Stack>
              )}

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
              >
                <Stack direction="row" spacing={0.5} >
                  <ThumbUpAltOutlinedIcon
                    fontSize="small"
                    sx={{ color: "primary.main" }}
                  />
                  <Typography variant="body2">
                    {likeCount}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <ThumbDownAltOutlinedIcon
                    fontSize="small"
                    sx={{ color: "error.main" }}
                  />
                  <Typography variant="body2">
                    {dislikeCount}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default CommentDrawer;
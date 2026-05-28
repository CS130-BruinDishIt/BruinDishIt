import { useEffect, useState } from "react";
import commentsData from "./data/comments.json";

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

const CommentDrawer = ({ item }) => {
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (!item?.id) return;
    const entry = commentsData[item.id];
    const sortedReviews = [...(entry?.reviews || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const sortedPhotos = [...(entry?.photos || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setReviews(sortedReviews);
    setPhotos(sortedPhotos);
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
                  src={`/src/assets/${photo.path}`}
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
        <Typography>No comments yet.</Typography>
      ) : (
        reviews.map((r, i) => (
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
                    src={`/src/assets/${photo}`}
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
                  {r.likes?.length || 0}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.5}>
                <ThumbDownAltOutlinedIcon
                  fontSize="small"
                  sx={{ color: "error.main" }}
                />
                <Typography variant="body2">
                  {r.dislikes?.length || 0}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default CommentDrawer;
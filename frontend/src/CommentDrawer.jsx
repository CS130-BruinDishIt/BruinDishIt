import { useEffect, useRef, useState } from "react";
import { createItemReview, fetchItemReviews, updateItemReview } from "./api/dining";

import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short', // options: 'full', 'long', 'medium', 'short'
  timeStyle: 'short'
});

// GitHub "merge approved" green used for enabled submit buttons.
const READY_BUTTON_COLOR = "#2da44e";

// Support both hosted URLs, data URLs, and legacy local asset filenames.
const resolvePhotoSrc = (value) => {
  if (!value) return "";
  if (/^(https?:\/\/|data:)/i.test(value)) return value;
  return `/src/assets/${value}`;
};

// Rebuild the gallery list from reviews when local updates occur.
const buildPhotosFromReviews = (reviewList) => (
  reviewList
    .map((review) => {
      const path = review.imageUrl || review.photos?.[0];
      if (!path) return null;
      return {
        path,
        userID: review.user || review.userID,
        date: review.date,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
);

const CommentDrawer = ({ item }) => {
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  // Form state for creating or editing a review.
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState("");
  const [formImageData, setFormImageData] = useState("");
  const [formImageName, setFormImageName] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // Derived form state used for button enablement and labels.
  const isEditing = Boolean(editingReviewId);
  const numericRating = Number(formRating);
  const isFormValid = formText.trim().length > 0 && numericRating >= 1 && numericRating <= 5;
  const submitLabel = isEditing ? "Update review" : "Post review";

  // Reset the form when switching items or after successful submission.
  const resetForm = () => {
    setFormText("");
    setFormRating("");
    setFormImageData("");
    setFormImageName("");
    setEditingReviewId(null);
  };

  // Cache uploaded images as data URLs so they can be stored in the DB.
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormImageData(String(reader.result || ""));
      setFormImageName(file.name);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Populate the form with an existing review and scroll it into view.
  const handleEditReview = (review) => {
    if (!review?.id) return;
    setEditingReviewId(review.id);
    setFormText(review.review || review.text || "");
    setFormRating(review.rating ? String(review.rating) : "");
    const existingImage = review.imageUrl || review.photos?.[0] || "";
    setFormImageData(existingImage);
    setFormImageName(existingImage ? "Existing image" : "");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Submit a new review or update an existing one.
  const handleSubmit = async () => {
    if (!item?.id || !isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      text: formText.trim(),
      rating: numericRating,
      imageUrl: formImageData || null,
    };

    if (!isEditing) {
      payload.user = "Guest";
    }

    try {
      const response = isEditing
        ? await updateItemReview(item.id, editingReviewId, payload)
        : await createItemReview(item.id, payload);

      const updatedReview = response?.review;
      if (updatedReview) {
        setReviews((prev) => {
          const next = [
            ...prev.filter((review) => review.id !== updatedReview.id),
            updatedReview,
          ].sort((a, b) => new Date(b.date) - new Date(a.date));
          setPhotos(buildPhotosFromReviews(next));
          return next;
        });
      }

      resetForm();
    } catch (error) {
      // Keep the UI responsive even if the API fails; error surfacing can be added later.
      console.error("Failed to save review", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load reviews and gallery data from the backend for the selected item.
  useEffect(() => {
    if (!item?.id) return;
    const controller = new AbortController();
    setReviews([]);
    setPhotos([]);
    resetForm();

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
    <Box sx={{ width: "100%", height: "100%", p: 3, overflowY: "auto", overflowX: "hidden" }}>

      <Typography variant="h6">{item.name}</Typography>

      <Typography variant="caption" color="text.secondary">
        ID: {item.id}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Review input form (used for both create and edit flows). */}
      <Box
        ref={formRef}
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {isEditing ? "Edit your review" : "Write a review"}
        </Typography>

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Review"
            placeholder="Share your thoughts"
            multiline
            minRows={3}
            fullWidth
            value={formText}
            onChange={(event) => setFormText(event.target.value)}
          />

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="rating-label">Rating</InputLabel>
              <Select
                labelId="rating-label"
                value={formRating}
                label="Rating"
                onChange={(event) => setFormRating(event.target.value)}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
            <IconButton
              aria-label="Upload image"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadFileOutlinedIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {formImageName || (formImageData ? "Image attached" : "No image")}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            disableElevation
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
            sx={{
              bgcolor: isFormValid ? READY_BUTTON_COLOR : "grey.400",
              color: "white",
              alignSelf: "flex-start",
              "&:hover": {
                bgcolor: isFormValid ? "#2c974b" : "grey.400",
              },
              "&.Mui-disabled": {
                bgcolor: "grey.300",
                color: "grey.600",
              },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Box>

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
              overflowX: "hidden",
              flexWrap: "nowrap",
              gap: 1,
              minWidth: 0,
              pb: 1,
            }}
          >
            {photos.map((photo, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: "1 1 0",
                  minWidth: 0,
                }}
              >
                <Box
                  component="img"
                  src={resolvePhotoSrc(photo.path || photo.url || photo)}
                  alt={photo.path}
                  sx={{
                    width: "100%",
                    height: 160,
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
            <Box key={r.id || i} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  User {r.userID || r.user}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Edit review"
                  disabled={!r.id}
                  onClick={() => handleEditReview(r)}
                >
                  {/* Edit icon toggles the form above into update mode. */}
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {formatter.format(new Date(r.date))}
              </Typography>

              <Typography sx={{ mt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {r.review}
              </Typography>

              {r.photos?.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 2,
                    overflowX: "hidden",
                    flexWrap: "nowrap",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  {r.photos.map((photo, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={resolvePhotoSrc(photo)}
                      sx={{
                        flex: "1 1 0",
                        minWidth: 0,
                        width: "100%",
                        height: 96,
                        objectFit: "cover",
                        borderRadius: 2,
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
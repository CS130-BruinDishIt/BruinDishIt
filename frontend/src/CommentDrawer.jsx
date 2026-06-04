import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser } from "./api/auth";
import { createReview, fetchReviews, reactToReview, updateReview, deleteReview, uploadImage } from "./api/dining";

import "./styles/CommentDrawer.css";

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
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import ImageLightbox from "./components/ImageLightbox";
import DeleteIcon from "@mui/icons-material/Delete";

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

// Stars displayed for reviews 
const buildStars = (rating) => {
  const numericRating = Number(rating) || 0;

  return Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    // display full star
    if (numericRating >= starValue) {
      return (
        <StarIcon
          key={index}
          fontSize="small"
          sx={{ color: "#f5b301" }}
        />
      );
    }

    // display half star
    if (numericRating >= starValue - 0.5) {
      return (
        <StarHalfIcon
          key={index}
          fontSize="small"
          sx={{ color: "#f5b301" }}
        />
      );
    }

    return (
      <StarBorderIcon
        key={index}
        fontSize="small"
        sx={{ color: "#d6d6d6" }}
      />
    );
  });
};

const getRatingBoxStyle = (rating) => {
  const num = Number(rating);
  if (!num || num <= 0) return { bgcolor: 'grey.100', color: 'text.primary', borderColor: 'grey.300' };
  if (num < 2.0) return { bgcolor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' };
  if (num < 3.0) return { bgcolor: '#ed6c02', color: '#fff', borderColor: '#ed6c02' };
  if (num < 4.0) return { bgcolor: '#fbc02d', color: '#000', borderColor: '#fbc02d' };
  if (num < 4.6) return { bgcolor: '#4caf50', color: '#fff', borderColor: '#4caf50' };
  return { bgcolor: '#2e7d32', color: '#fff', borderColor: '#2e7d32' };
};

const CommentDrawer = ({ item }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const openImage = (img) => {
    setActiveImage(img);
    setLightboxOpen(true);
  };
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const isLoggedIn = Boolean(authUser);
  const authUserId = authUser?.id || authUser?._id;

  const isOwnReview = (review) => isLoggedIn && String(review.userId) === String(authUserId);


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
  const isFormValid = formRating !== "" && numericRating >= 0.5 && numericRating <= 5; // no need to have formText.trim().length > 0 since only rating is required to submit
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
  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormImageName(file.name); // show filename right away

    try {
      const url = await uploadImage(file); // upload to R2 and get back a URL
      setFormImageData(url);
    } catch (err) {
      console.error("Image upload failed", err);
    }

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
    if (!isLoggedIn) return; // blocks guest from submitting, but reviews still visible
    if (!item?.id || !isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      text: formText.trim(),
      rating: numericRating,
      imageUrl: formImageData || null,
    };



    const itemType = item.type || "items";
    try {
      const response = isEditing
        ? await updateReview(item.id, itemType, editingReviewId, payload)
        : await createReview(item.id, itemType, payload);

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

  const handleReaction = async (reviewId, reaction) => {
    if (!item?.id || !reviewId) return;
    if (!isLoggedIn) {
      navigate("/signin", {
        state: { from: `${window.location.pathname}${window.location.hash}` },
      });
      return;
    }

    try {
      const itemType = item.type || "items";
      const response = await reactToReview(item.id, itemType, reviewId, reaction);
      const updatedReview = response?.review;
      if (!updatedReview) return;

      setReviews((prev) =>
        prev.map((review) => (review.id === updatedReview.id ? updatedReview : review))
      );
    } catch (error) {
      console.error("Failed to react to review", error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!item?.id || !reviewId) return;
    if (!isLoggedIn) {
      navigate("/signin", {
        state: { from: `${window.location.pathname}${window.location.hash}` },
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const itemType = item.type || "items";
      await deleteReview(item.id, itemType, reviewId);

      setReviews((prev) => {
        const next = prev.filter((review) => review.id !== reviewId);
        setPhotos(buildPhotosFromReviews(next));
        return next;
      });
      if (editingReviewId === reviewId) {   // removes immediately if user deletes
        resetForm();
      }

    } catch (error) {
      console.error("Failed to delete review", error);
    }


  }

  // Load reviews and gallery data from the backend for the selected item.
  useEffect(() => {
    if (!item?.id) return;
    const controller = new AbortController();
    setReviews([]);
    setPhotos([]);
    resetForm();

    const itemType = item.type || "items";
    const fetchFn = itemType === 'halls'
      ? fetchReviews(item.id, 'halls', { signal: controller.signal })
      : fetchReviews(item.id, 'items', { signal: controller.signal });

    fetchFn
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

  return (<>
    <Box sx={{
      width: "100%", maxWidth: "100%", boxSizing: "border-box", height: "100%", p: 3, overflowY: "auto", overflowX: "hidden",
    }}
    >

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h6">{item.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {item.id}
          </Typography>
        </Box>
      


        <Box sx={{ ml: 1, px: 0.75, py: 0.75, height: 'fit-content', alignSelf: 'center', borderRadius: 1, border: '1px solid', display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...getRatingBoxStyle(item.averageRating) }}>
          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ color: 'inherit' }}>
            <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600, lineHeight: 1 }}>
              {item.averageRating > 0 ? Number(item.averageRating).toFixed(1) : "--"}
            </Typography>
            <StarIcon sx={{ fontSize: '0.875rem', color: 'inherit' }} />
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Review input form (used for both create and edit flows). */}
      {isLoggedIn ? (
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
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (  // half-star ratings supported
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
      ) : (
        <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", mb: 3, textAlign: "center", }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Want to leave a review?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign in to rate posts, leave comments, or upload photos.
          </Typography>
          {/* window.Location.pathname -> /dining/bruin-plate    window.location.hash -> #....menuitemID  */}
          <Button component={Link} to="/signin" state={{ from: `${window.location.pathname}${window.location.hash}` }} variant="contained">
            Sign In
          </Button>
        </Box>
      )}

      {photos.length > 0 && (
        <>
          <Typography
            variant="h6"
            sx={{ mt: 2, mb: 1, fontWeight: 600 }}
          >
            Gallery
          </Typography>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={12}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              600: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
            }}
            style={{
              paddingBottom: "32px",
            }}
          >
            {photos.map((photo, idx) => (
              <SwiperSlide key={idx}>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: 220,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  }}
                >
                  <Box
                    component="img"
                    src={resolvePhotoSrc(photo.path || photo.url || photo)}
                    alt={photo.path || "gallery image"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onClick={() => openImage(photo)}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      {reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        reviews.map((r, i) => {
          const likedBy = Array.isArray(r.likedBy) ? r.likedBy : [];
          const dislikedBy = Array.isArray(r.dislikedBy) ? r.dislikedBy : [];
          const userLiked = Boolean(authUserId) && likedBy.some((id) => String(id) === String(authUserId));
          const userDisliked = Boolean(authUserId) && dislikedBy.some((id) => String(id) === String(authUserId));
          const likeCount = Number.isFinite(Number(r.likes)) ? Number(r.likes) : likedBy.length;
          const dislikeCount = Number.isFinite(Number(r.dislikes)) ? Number(r.dislikes) : dislikedBy.length;

          const LikeIcon = userLiked ? ThumbUpAltIcon : ThumbUpAltOutlinedIcon;
          const DislikeIcon = userDisliked ? ThumbDownAltIcon : ThumbDownAltOutlinedIcon;

          return (
            <Box key={r.id || i} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.userID || r.user}
                </Typography>
                {isOwnReview(r) && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                      size="small"
                      aria-label="Edit review"
                      disabled={!r.id}
                      onClick={() => handleEditReview(r)}
                      sx={{ color: "text.secondary", "&:hover": { color: "success.main"} }}
                    >
                      {/* Edit icon toggles the form above into update mode. */}
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      aria-label="Delete review"
                      disabled={!r.id}
                      onClick={() => handleDelete(r.id)}
                      sx={{ color: "text.secondary", "&:hover": { color: "error.main"} }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {formatter.format(new Date(r.date))}
              </Typography>

              {/* Display star icons for the rating. */}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                {buildStars(r.rating)}
                <Typography variant="body2" sx={{ fontWeight: 600, ml: 2.5 }}>
                  {Number(r.rating) || 0}/5
                </Typography>
              </Stack>

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
                    flexwrap: "nowrap",
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
                        minWidth: 0,
                        maxWidth: "15%",
                        maxHeight: "25vh",
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                      onClick={() => openImage(photo)}
                    />
                  ))}
                </Stack>
              )}

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    aria-label="Like review"
                    disabled={!r.id}
                    onClick={() => handleReaction(r.id, "like")}
                  >
                    <LikeIcon
                      fontSize="small"
                      sx={{ color: userLiked ? "primary.main" : "inherit" }}
                    />
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 32,
                      fontWeight: userLiked ? 700 : 400,
                      color: userLiked ? "primary.main" : "text.primary",
                    }}
                  >
                    {likeCount}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    aria-label="Dislike review"
                    disabled={!r.id}
                    onClick={() => handleReaction(r.id, "dislike")}
                  >
                    <DislikeIcon
                      fontSize="small"
                      sx={{ color: userDisliked ? "error.main" : "inherit" }}
                    />
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 32,
                      fontWeight: userDisliked ? 700 : 400,
                      color: userDisliked ? "error.main" : "text.primary",
                    }}
                  >
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
    <ImageLightbox
      open={lightboxOpen}
      image={activeImage}
      onClose={() => setLightboxOpen(false)}
    />
  </>
  );
};

export default CommentDrawer;
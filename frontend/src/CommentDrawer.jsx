import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import heic2any from "heic2any";
import { getAuthUser } from "./api/auth";
import { createReview, fetchReviews, reactToReview, updateReview, deleteReview, uploadImage } from "./api/dining";

import "./styles/CommentDrawer.css";

import {
  Avatar,
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import NorthIcon from "@mui/icons-material/North";
import DeleteIcon from "@mui/icons-material/Delete";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import ImageLightbox from "./components/ImageLightbox";
import RatingBox from "./components/RatingBox"

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
        userId: review.user || review.userId,
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

  const isOwnReview = (review) => {
    return isLoggedIn && String(review.userId._id) === String(authUserId);
  };

  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  // Form state for creating or editing a review.
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState("");
  const [formImageData, setFormImageData] = useState("");
  const [formImageName, setFormImageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortAsc, setSortAsc] = useState(false); // false = descending by default

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
    let file = event.target.files?.[0];
    if (!file) return;

    // convert HEIC to JPEG before uploading
    setIsLoading(true);
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "heic" || ext === "heif") {
      try {
        const converted = await heic2any({ blob: file, toType: "image/jpeg" });
        file = new File([converted], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
      } catch (err) {
        console.error("HEIC conversion failed", err);
        event.target.value = "";
        return;
      }
    }

    setFormImageName(file.name); // show filename right away

    try {
      const url = await uploadImage(file); // upload to R2 and get back a URL
      setFormImageData(url);
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setIsLoading(false);
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

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      let valA, valB;
      if (sortBy === "date") { valA = new Date(a.date); valB = new Date(b.date); }
      if (sortBy === "rating") { valA = a.rating; valB = b.rating; }
      if (sortBy === "likes") { valA = a.likes; valB = b.likes; }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [reviews, sortBy, sortAsc]);

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
  }, [item?.id, item?.type]);

  if (!item) return null;

  return (<>
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Drawer Header */}
        <Box className="drawer-container">
          <Stack direction="row" className="drawer-header">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "700" }}>{item.name}</Typography>
            </Box>
            <RatingBox rating={item.averageRating} sx={{ ml: 1, alignSelf: "center" }} />
          </Stack>

          {/* Image Gallery */}
          {photos.length > 0 && (
            <Box className="gallery-container">
              <Typography variant="h6" className="gallery-title">Photos</Typography>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={14}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  600: { slidesPerView: 2 },
                  900: { slidesPerView: 3 },
                }}
                className="gallery-swiper"
              >
                {photos.map((photo, idx) => (
                  <SwiperSlide key={idx}>
                    <Box className="gallery-image-container">
                      <Box
                        component="img"
                        src={resolvePhotoSrc(photo.path || photo.url || photo)}
                        alt={photo.path || "gallery image"}
                        className="gallery-image"
                        onClick={() => openImage(photo)}
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          )}

          {/* Reviews Header */}
          <Stack direction="row" className="review-header-container">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Reviews</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Sort by: </Typography>
              <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="likes">Likes</MenuItem>
              </Select>

              <IconButton onClick={() => setSortAsc(prev => !prev)}>
                <NorthIcon sx={{ transform: sortAsc ? "scaleY(-1)" : "scaleY(1)" }} />
              </IconButton>
            </Box>
          </Stack>
          <Divider sx={{ m: 2 }} />

          {/* Reviews */}
          {reviews.length === 0 ? (
            <Box className="reviews-container">
              <Typography>No reviews yet.</Typography>
            </Box>
          ) : (
            sortedReviews.map((r, i) => {
              const likedBy = Array.isArray(r.likedBy) ? r.likedBy : [];
              const dislikedBy = Array.isArray(r.dislikedBy) ? r.dislikedBy : [];
              const userLiked = Boolean(authUserId) && likedBy.some((id) => String(id) === String(authUserId));
              const userDisliked = Boolean(authUserId) && dislikedBy.some((id) => String(id) === String(authUserId));
              const likeCount = Number.isFinite(Number(r.likes)) ? Number(r.likes) : likedBy.length;
              const dislikeCount = Number.isFinite(Number(r.dislikes)) ? Number(r.dislikes) : dislikedBy.length;
              const profilePic = r.userId?.profileImageURL ? resolvePhotoSrc(r.userId.profileImageURL) : undefined;

              const LikeIcon = userLiked ? ThumbUpAltIcon : ThumbUpAltOutlinedIcon;
              const DislikeIcon = userDisliked ? ThumbDownAltIcon : ThumbDownAltOutlinedIcon;

              return (
                <Box key={r.id || i} className="reviews-container">
                  <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.5 }}>
                    <IconButton onClick={() => navigate(`/user/${r.userId._id}`)} size="small">
                      <Avatar
                        // If populated, use the URL. Otherwise, fallback.
                        src={resolvePhotoSrc(profilePic)}
                        sx={{ width: 32, height: 32 }}
                      >
                        {/* Fallback icon if no picture exists */}
                        {!profilePic && <AccountCircleIcon />}
                      </Avatar>
                    </IconButton>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        color: "primary.main",
                        mr: 4,
                      }}
                    >{r.user}</Typography>
                    {isOwnReview(r) && (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          aria-label="Edit review"
                          disabled={!r.id}
                          onClick={() => handleEditReview(r)}
                          className="edit-btn"
                        >
                          {/* Edit icon toggles the form above into update mode. */}
                          <EditOutlinedIcon fontSize="small" />
                          <Typography variant="caption" sx={{ fontSize: 11 }}>
                            Edit
                          </Typography>
                        </IconButton>

                        <IconButton
                          size="small"
                          aria-label="Delete review"
                          disabled={!r.id}
                          onClick={() => handleDelete(r.id)}
                          className="delete-btn"
                        >
                          <DeleteIcon fontSize="small" />
                          <Typography variant="caption" sx={{ fontSize: 11 }}>Delete</Typography>
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>

                  {/* Meta (date) */}
                  <Typography variant="caption" className="date-metadata">
                    Posted {formatter.format(new Date(r.date))}
                  </Typography>

                  {/* Review text */}
                  <Typography className="review-txt">{r.review}</Typography>

                  <Stack
                    direction="row"
                    sx={{ mt: 1.2, alignItems: "center" }}
                  >
                    {/* Star badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                        px: 1,
                        py: 0.4,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                        lineHeight: 1,
                      }}
                    >
                      {buildStars(r.rating)}
                    </Box>

                    {/* Score (perfect vertical alignment) */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "text.secondary",
                        ml: 1,
                        lineHeight: 1,
                      }}
                    >
                      {Number(r.rating) || 0}/5
                    </Typography>
                  </Stack>

                  {/* Review photo */}
                  {r.photos?.length > 0 && (
                    <Stack direction="row" spacing={1} className="review-photo-container">
                      {r.photos.map((photo, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={resolvePhotoSrc(photo)}
                          className="review-photo"
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
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        aria-label="Like review"
                        disabled={!r.id}
                        onClick={() => handleReaction(r.id, "like")}
                      >
                        <LikeIcon fontSize="small" sx={{ color: userLiked ? "primary.main" : "inherit" }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        className="vote-count"
                        sx={{
                          fontWeight: userLiked ? 700 : 400,
                          color: userLiked ? "primary.main" : "text.primary",
                        }}
                      >
                        {likeCount}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5}>
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
                        className="vote-count"
                        sx={{
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
      </Box>

      {/* Review input form (used for both create and edit flows). */}
      {isLoggedIn ? (
        <Box className="review-form-wrapper">
          <Box className="review-form-container">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isEditing ? "Edit your review" : "Write a review!"}
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Review"
                placeholder="Share your thoughts"
                multiline
                minRows={2}
                maxRows={2}
                fullWidth
                value={formText}
                onChange={(event) => setFormText(event.target.value)}
                sx={{ "& .MuiInputBase-input": { maxHeight: "6.5em", overflowY: "auto" } }}
              />

              <Stack direction="row" spacing={2} >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="rating-label">Rating</InputLabel>
                  <Select
                    labelId="rating-label"
                    value={formRating}
                    label="Rating"
                    onChange={(event) => setFormRating(event.target.value)}
                  >
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (  // half-star ratings supported
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />

                <Box className="upload-container">
                  <IconButton
                    aria-label="Upload image"
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-icon"
                  >
                    <UploadFileOutlinedIcon fontSize="small" />
                  </IconButton>

                  <Typography variant="caption" color="text.secondary" className="upload-filename">
                    {formImageName || (formImageData ? "Image attached" : "No image selected")}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                disableElevation
                disabled={!isFormValid || isSubmitting || isLoading}
                onClick={handleSubmit}
                sx={{
                  bgcolor: isFormValid ? READY_BUTTON_COLOR : "grey.400",
                  color: "white",
                  alignSelf: "flex-start",
                  "&:hover": { bgcolor: isFormValid ? "#2c974b" : "grey.400" },
                  "&.Mui-disabled": { bgcolor: "grey.300", color: "grey.600" },
                }}
              >
                {submitLabel}
              </Button>
              {isEditing && (
                <Button disabled={isSubmitting || isLoading} onClick={resetForm}>
                  CANCEL EDIT
                </Button>
              )}
            </Stack>
          </Box>
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
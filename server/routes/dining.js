import express from "express";
import mongoose from "mongoose";
import DailyMenu from "../models/Menu.js";
import Review from "../models/Review.js";
import MenuItem from "../models/MenuItem.js";
import DiningHall from "../models/DiningHall.js";
import {requireAuth} from "../authentication/requireAuth.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import crypto from "crypto";
import 'dotenv/config';

const router = express.Router();

// Shape review documents for the existing CommentDrawer UI.
const mapReviewForDrawer = (review) => ({
	id: review._id,
	userId: review.userId,
	user: review.user,
	date: review.date,
	review: review.text,
	rating: review.rating,
	likes: review.likes,
	dislikes: review.dislikes,
	likedBy: (review.likedBy || []).map((id) => String(id)),
	dislikedBy: (review.dislikedBy || []).map((id) => String(id)),
	imageUrl: review.imageUrl || null,
	photos: review.imageUrl ? [review.imageUrl] : [],
});

// Return the daily menus for a hall, optionally filtered by date.
router.get("/menus/:hallSlug", async (req, res, next) => {
	try {
		const { hallSlug } = req.params;
		// Default to today so the frontend can omit the query param.
		const date = req.query.date || new Date().toISOString().split("T")[0];

		if (!hallSlug) {
			return res.status(400).json({ message: "Hall slug is required." });
		}

		// Fetch only what the UI needs and populate item names/ratings.
		const menus = await DailyMenu.find({ hallName: hallSlug, date })
			.select("mealType stations")
			.populate({
				path: "stations.items",
				select: "name averageRating",
			})
			.lean();

		if (!menus.length) {
			return res.status(404).json({ message: "Menu not found." });
		}

		// Normalize the response shape for the frontend render loop.
		const meals = menus.map((menu) => ({
			mealType: menu.mealType,
			stations: menu.stations.map((station) => ({
				stationName: station.stationName,
				items: station.items.map((item) => ({
					id: item._id,
					name: item.name,
					averageRating: item.averageRating,
				})),
			})),
		}));

		// Small cache window to reduce duplicate requests during browsing.
		res.set("Cache-Control", "public, max-age=300");
		return res.json({ date, hallSlug, meals });
	} catch (error) {
		return next(error);
	}
});

// Fetch reviews for a menu item and normalize them to the frontend's existing shape.
async function getReviews(id, idField, req, res, next) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid id is required." });
    }

    const reviews = await Review.find({ [idField]: id })
      .sort({ date: -1 })
      .lean();

    return res.json({
      reviews: reviews.map(mapReviewForDrawer),
      photos: reviews
        .filter((review) => review.imageUrl)
        .map((review) => ({
          path: review.imageUrl,
          userID: review.user,
          date: review.date,
        })),
    });
  } catch (error) {
    return next(error);
  }
}

// Separate endpoints for fetching reviews for menu items vs dining halls
router.get("/items/:itemId/reviews", (req, res, next) =>
  getReviews(req.params.itemId, "itemId", req, res, next)
);
router.get("/halls/:hallId/reviews", (req, res, next) =>
  getReviews(req.params.hallId, "hallId", req, res, next)
);

// // Create a new review for a menu item.
async function createReview(id, idField, req, res, next) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid id is required." });
    }

    const text = String(req.body.text || "").trim();
    const rating = Number(req.body.rating);
    const user = req.user.username;
	const userId = req.user.id || req.user._id;
    const imageUrl = req.body.imageUrl || null;

    //if (!text) return res.status(400).json({ message: "Review text is required." });
    if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 0.5 and 5." });
    }

    const review = await Review.create({
      [idField]: id,  // either "itemId" or "hallId"
      user, userId, rating, text, imageUrl,
      date: new Date(),
    });

    return res.status(201).json({ review: mapReviewForDrawer(review) });
  } catch (error) {
    return next(error);
  }
}
// Separate endpoints for uploading reviews for menu items vs dining halls
router.post("/items/:itemId/reviews", requireAuth, (req, res, next) => 
  createReview(req.params.itemId, "itemId", req, res, next)
);
router.post("/halls/:hallId/reviews", requireAuth, (req, res, next) => 
  createReview(req.params.hallId, "hallId", req, res, next)
);


async function updateReview(id, idField, reviewId, req, res, next) {
  try {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
	  return res.status(400).json({ message: "Valid id is required." });
	}
	if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
	  return res.status(400).json({ message: "Valid review id is required." });
	}

	const text = String(req.body.text || "").trim();
	const rating = Number(req.body.rating);

	//if (!text) return res.status(400).json({ message: "Review text is required." });
	if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) {
	  return res.status(400).json({ message: "Rating must be between 0.5 and 5." });
	}

	const update = { text, rating, date: new Date() };
	if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
	  update.imageUrl = req.body.imageUrl || null;
	}

	const review = await Review.findOneAndUpdate(
	  { _id: reviewId, [idField]: id, userId: req.user.id || req.user.userId || req.user._id }, // users can only edit their own reviews
	  update,
	  { returnDocument: "after", runValidators: true }
	);

	if (!review) {
	  return res.status(404).json({ message: "Review not found or You are not the owner of this review." });
	}

	return res.json({ review: mapReviewForDrawer(review) });
  } catch (error) {
	return next(error);
  }
}
// Separate endpoints for updating reviews for menu items vs dining halls
router.put("/items/:itemId/reviews/:reviewId", requireAuth, (req, res, next) =>
  updateReview(req.params.itemId, "itemId", req.params.reviewId, req, res, next)
);
router.put("/halls/:hallId/reviews/:reviewId", requireAuth, (req, res, next) =>
  updateReview(req.params.hallId, "hallId", req.params.reviewId, req, res, next)
);

// Increment like/dislike counts for a review and return the updated review.
async function reactToReview(id, idField, reviewId, req, res, next) {
	try {
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Valid id is required." });
		}
		if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
			return res.status(400).json({ message: "Valid review id is required." });
		}

		const reaction = String(req.body?.reaction || "").toLowerCase();
		if (reaction !== "like" && reaction !== "dislike") {
			return res.status(400).json({ message: "Reaction must be either 'like' or 'dislike'." });
		}

		const review = await Review.findOne({ _id: reviewId, [idField]: id });

		if (!review) {
			return res.status(404).json({ message: "Review not found." });
		}

		// User review interaction (like/dislike)
		// Ensure the user can only like/dislike once and can toggle their reaction.
		const userId = String(req.user.id || req.user.userId || req.user._id);
		review.likedBy = Array.isArray(review.likedBy) ? review.likedBy : [];
		review.dislikedBy = Array.isArray(review.dislikedBy) ? review.dislikedBy : [];

		const hasLiked = review.likedBy.some((idValue) => String(idValue) === userId);
		const hasDisliked = review.dislikedBy.some((idValue) => String(idValue) === userId);

		if (reaction === "like") {
			if (hasLiked) {
				review.likedBy = review.likedBy.filter((idValue) => String(idValue) !== userId);
			} else {
				review.likedBy.push(userId);
				if (hasDisliked) {
					review.dislikedBy = review.dislikedBy.filter((idValue) => String(idValue) !== userId);
				}
			}
		} else if (reaction === "dislike") {
			if (hasDisliked) {
				review.dislikedBy = review.dislikedBy.filter((idValue) => String(idValue) !== userId);
			} else {
				review.dislikedBy.push(userId);
				if (hasLiked) {
					review.likedBy = review.likedBy.filter((idValue) => String(idValue) !== userId);
				}
			}
		}

		// Keep numeric counters in sync for quick UI display and backwards compatibility.
		review.likes = review.likedBy.length;
		review.dislikes = review.dislikedBy.length;

		await review.save();

		return res.json({ review: mapReviewForDrawer(review) });
	} catch (error) {
		return next(error);
	}
}

router.post("/items/:itemId/reviews/:reviewId/reactions", requireAuth, (req, res, next) =>
	reactToReview(req.params.itemId, "itemId", req.params.reviewId, req, res, next)
);
router.post("/halls/:hallId/reviews/:reviewId/reactions", requireAuth, (req, res, next) =>
	reactToReview(req.params.hallId, "hallId", req.params.reviewId, req, res, next)
);

// Return unique menu items of all time for each dining hall
router.get("/items/:hallSlug", async (req, res, next) => {
	try {
		const { hallSlug } = req.params;

		if (!hallSlug) {
			return res.status(400).json({ message: "Hall slug is required." });
		}

		// get all unique menu items
		const items = await MenuItem.find({hallName: hallSlug})
			.select("name averageRating dateAdded lastSeen")
			.sort({name: 1})
			.lean();

		if (!items.length) {
			return res.status(404).json({ message: "Menu items not found." });
		}

		return res.json({
			hallSlug,
			items: items.map((item) => ({
				id: item._id,
				name: item.name,
				averageRating: item.averageRating,
				dateAdded: item.dateAdded,
				lastSeen: item.lastSeen,
			})),
		});
	} catch (error) {
		return next(error);
	}
});

async function deleteReview(id, idField, reviewId, req, res, next) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid id is required." });
    }

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Valid review id is required." });
    }

	const userId = req.user.id || req.user._id;
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      [idField]: id,
      userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you do not have permission to delete it.",
      });
    }

    return res.json({ message: "Review deleted successfully.", reviewId });
  } catch (error) {
    return next(error);
  }
}

// Separate endpoints for deleting reviews for menu items vs dining halls
router.delete("/items/:itemId/reviews/:reviewId", requireAuth, (req, res, next) =>
  deleteReview(req.params.itemId, "itemId", req.params.reviewId, req, res, next)
);
router.delete("/halls/:hallId/reviews/:reviewId", requireAuth, (req, res, next) => 
  deleteReview(req.params.hallId, "hallId", req.params.reviewId, req, res, next)
);

// Return a list of all dining halls with basic info for the homepage and navigation.
router.get("/halls", async (req, res, next) => {
	try {
		const halls = await DiningHall.find().select("slug name shortName averageRating level").lean();

		if (!halls.length) {
			return res.status(404).json({ message: "Dining halls not found." });
		}

		return res.json({
			halls: halls.map((hall) => ({
				slug: hall.slug,
				name: hall.name,
				shortName: hall.shortName,
				averageRating: hall.averageRating,
				level: hall.level,
			})),
		});
	} catch (error) {
		return next(error);
	}
});

// Return a specific dining hall.
router.get("/halls/:hallSlug", async (req, res, next) => {
	try {
		const { hallSlug } = req.params;

		if (!hallSlug) {
			return res.status(400).json({ message: "Hall slug is required." });
		}

		const hall = await DiningHall.findOne({ slug: hallSlug }).select("slug name shortName averageRating level").lean();

		if (!hall) {
			return res.status(404).json({ message: "Dining hall not found." });
		}

		return res.json({
			id: hall._id,
			slug: hall.slug,
			name: hall.name,
			shortName: hall.shortName,
			averageRating: hall.averageRating,
			level: hall.level,
		});
	} catch (error) {
		return next(error);
	}
});

// Upload images to Cloudflare R2
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, // like a username for R2
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, // like a password for R2
  },
});

// Configure multer to hold uploaded files in memory and limit file size to 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/uploadImage", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

	// Generate a unique filename using UUID and preserve the original file extension
    const ext = req.file.originalname.split(".").pop();
    const key = `reviews/${crypto.randomUUID()}.${ext}`;

	// Upload file to R2
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

	// Build the public URL to access the uploaded image
    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    return res.json({ url });

  } catch (error) {
    return next(error);
  }
});

export default router;



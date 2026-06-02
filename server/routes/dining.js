import express from "express";
import mongoose from "mongoose";
import DailyMenu from "../models/Menu.js";
import Review from "../models/Review.js";
import MenuItem from "../models/MenuItem.js";
import DiningHall from "../models/DiningHall.js";
import {requireAuth} from "../authentication/requireAuth.js";

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

// // Fetch reviews for a menu item and normalize them to the frontend's existing shape.
// router.get("/items/:itemId/reviews", async (req, res, next) => {
// 	try {
// 		const { itemId } = req.params;

// 		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
// 			return res.status(400).json({ message: "Valid item id is required." });
// 		}

// 		const reviews = await Review.find({ itemId })
// 			.sort({ date: -1 })
// 			.lean();

// 		// Keep response fields aligned with the CommentDrawer expectations.
// 		const response = {
// 			itemId,
// 			reviews: reviews.map(mapReviewForDrawer),
// 			photos: reviews
// 				.filter((review) => review.imageUrl)
// 				.map((review) => ({
// 					path: review.imageUrl,
// 					userID: review.user,
// 					date: review.date,
// 				})),
// 		};

// 		return res.json(response);
// 	} catch (error) {
// 		return next(error);
// 	}
// });
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
// router.post("/items/:itemId/reviews", async (req, res, next) => {
// 	try {
// 		const { itemId } = req.params;

// 		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
// 			return res.status(400).json({ message: "Valid item id is required." });
// 		}

// 		const text = String(req.body.text || "").trim();
// 		const rating = Number(req.body.rating);
// 		const user = String(req.body.user || "Guest").trim();
// 		const imageUrl = req.body.imageUrl || null;

// 		if (!text) {
// 			return res.status(400).json({ message: "Review text is required." });
// 		}

// 		if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
// 			return res.status(400).json({ message: "Rating must be between 1 and 5." });
// 		}

// 		// Store the review in the database with a submission timestamp.
// 		const review = await Review.create({
// 			itemId,
// 			user,
// 			rating,
// 			text,
// 			imageUrl,
// 			date: new Date(),
// 		});

// 		return res.status(201).json({ review: mapReviewForDrawer(review) });
// 	} catch (error) {
// 		return next(error);
// 	}
// });
async function createReview(id, idField, req, res, next) {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid id is required." });
    }

    const text = String(req.body.text || "").trim();
    const rating = Number(req.body.rating);
    const user = req.user.username;
	const userId = req.user._id;
    const imageUrl = req.body.imageUrl || null;

    if (!text) return res.status(400).json({ message: "Review text is required." });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
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

// // Update an existing review for a menu item.
// router.put("/items/:itemId/reviews/:reviewId", async (req, res, next) => {
// 	try {
// 		const { itemId, reviewId } = req.params;

// 		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
// 			return res.status(400).json({ message: "Valid item id is required." });
// 		}

// 		if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
// 			return res.status(400).json({ message: "Valid review id is required." });
// 		}

// 		const text = String(req.body.text || "").trim();
// 		const rating = Number(req.body.rating);

// 		if (!text) {
// 			return res.status(400).json({ message: "Review text is required." });
// 		}

// 		if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
// 			return res.status(400).json({ message: "Rating must be between 1 and 5." });
// 		}

// 		const update = {
// 			text,
// 			rating,
// 			date: new Date(),
// 		};

// 		if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
// 			update.imageUrl = req.body.imageUrl || null;
// 		}

// 		const review = await Review.findOneAndUpdate(
// 			{ _id: reviewId, itemId },
// 			update,
// 			{ new: true, runValidators: true }
// 		);

// 		if (!review) {
// 			return res.status(404).json({ message: "Review not found." });
// 		}

// 		return res.json({ review: mapReviewForDrawer(review) });
// 	} catch (error) {
// 		return next(error);
// 	}
// });
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

	if (!text) return res.status(400).json({ message: "Review text is required." });
	if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
	  return res.status(400).json({ message: "Rating must be between 1 and 5." });
	}

	const update = { text, rating, date: new Date() };
	if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
	  update.imageUrl = req.body.imageUrl || null;
	}

	const review = await Review.findOneAndUpdate(
	  { _id: reviewId, [idField]: id, userId: req.user._id }, // users can only edit their own reviews
	  update,
	  { new: true, runValidators: true }
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

		const update = reaction === "like" ? { $inc: { likes: 1 } } : { $inc: { dislikes: 1 } };

		const review = await Review.findOneAndUpdate(
			{ _id: reviewId, [idField]: id },
			update,
			{ new: true, runValidators: true }
		);

		if (!review) {
			return res.status(404).json({ message: "Review not found." });
		}

		return res.json({ review: mapReviewForDrawer(review) });
	} catch (error) {
		return next(error);
	}
}

router.post("/items/:itemId/reviews/:reviewId/reactions", (req, res, next) =>
	reactToReview(req.params.itemId, "itemId", req.params.reviewId, req, res, next)
);
router.post("/halls/:hallId/reviews/:reviewId/reactions", (req, res, next) =>
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

export default router;

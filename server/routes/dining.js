import express from "express";
import mongoose from "mongoose";
import DailyMenu from "../models/Menu.js";
import Review from "../models/Review.js";

const router = express.Router();

// Shape review documents for the existing CommentDrawer UI.
const mapReviewForDrawer = (review) => ({
	id: review._id,
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

// Fetch reviews for a menu item and normalize them to the frontend's existing shape.
router.get("/items/:itemId/reviews", async (req, res, next) => {
	try {
		const { itemId } = req.params;

		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
			return res.status(400).json({ message: "Valid item id is required." });
		}

		const reviews = await Review.find({ itemId })
			.sort({ date: -1 })
			.lean();

		// Keep response fields aligned with the CommentDrawer expectations.
		const response = {
			itemId,
			reviews: reviews.map(mapReviewForDrawer),
			photos: reviews
				.filter((review) => review.imageUrl)
				.map((review) => ({
					path: review.imageUrl,
					userID: review.user,
					date: review.date,
				})),
		};

		return res.json(response);
	} catch (error) {
		return next(error);
	}
});

// Create a new review for a menu item.
router.post("/items/:itemId/reviews", async (req, res, next) => {
	try {
		const { itemId } = req.params;

		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
			return res.status(400).json({ message: "Valid item id is required." });
		}

		const text = String(req.body.text || "").trim();
		const rating = Number(req.body.rating);
		const user = String(req.body.user || "Guest").trim();
		const imageUrl = req.body.imageUrl || null;

		if (!text) {
			return res.status(400).json({ message: "Review text is required." });
		}

		if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
			return res.status(400).json({ message: "Rating must be between 1 and 5." });
		}

		// Store the review in the database with a submission timestamp.
		const review = await Review.create({
			itemId,
			user,
			rating,
			text,
			imageUrl,
			date: new Date(),
		});

		return res.status(201).json({ review: mapReviewForDrawer(review) });
	} catch (error) {
		return next(error);
	}
});

// Update an existing review for a menu item.
router.put("/items/:itemId/reviews/:reviewId", async (req, res, next) => {
	try {
		const { itemId, reviewId } = req.params;

		if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
			return res.status(400).json({ message: "Valid item id is required." });
		}

		if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
			return res.status(400).json({ message: "Valid review id is required." });
		}

		const text = String(req.body.text || "").trim();
		const rating = Number(req.body.rating);

		if (!text) {
			return res.status(400).json({ message: "Review text is required." });
		}

		if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
			return res.status(400).json({ message: "Rating must be between 1 and 5." });
		}

		const update = {
			text,
			rating,
			date: new Date(),
		};

		if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
			update.imageUrl = req.body.imageUrl || null;
		}

		const review = await Review.findOneAndUpdate(
			{ _id: reviewId, itemId },
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
});

export default router;

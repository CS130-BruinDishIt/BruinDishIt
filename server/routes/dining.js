import express from "express";
import mongoose from "mongoose";
import DailyMenu from "../models/Menu.js";
import Review from "../models/Review.js";

const router = express.Router();

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
			reviews: reviews.map((review) => ({
				user: review.user,
				date: review.date,
				review: review.text,
				rating: review.rating,
				likes: review.likes,
				dislikes: review.dislikes,
				photos: review.imageUrl ? [review.imageUrl] : [],
			})),
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

export default router;

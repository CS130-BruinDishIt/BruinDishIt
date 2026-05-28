import express from "express";
import DailyMenu from "../models/Menu.js";
import MenuItem from "../models/MenuItem.js";

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

// Return unique menu items of all time for each dining hall
router.get("/items/:hallSlug", async (req, res, next) => {
	try {
		const { hallSlug } = req.params;

		if (!hallSlug) {
			return res.status(400).json({ message: "Hall slug is required." });
		}

		// get all unique menu items
		const items = await MenuItem.find({hallName: hallSlug})
			.select("name averageRating dateAdded")
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
			})),
		});
	} catch (error) {
		return next(error);
	}
});

export default router;

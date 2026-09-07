import mongoose from "mongoose";
import "dotenv/config";
import DiningHall from "../models/DiningHall.js";
import MenuItem from "../models/MenuItem.js";
import Review from "../models/Review.js";

const roundAverageRating = (rating) => Math.round(Number(rating) * 10) / 10;

async function backfillModelStats(Model, reviewField) {
  await Model.updateMany({}, { $set: { averageRating: 0, reviewCount: 0 } });

  const stats = await Review.aggregate([
    { $match: { [reviewField]: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: `$${reviewField}`,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (!stats.length) {
    return 0;
  }

  const operations = stats.map(({ _id, averageRating, reviewCount }) => ({
    updateOne: {
      filter: { _id },
      update: {
        $set: {
          averageRating: roundAverageRating(averageRating),
          reviewCount,
        },
      },
    },
  }));

  const result = await Model.bulkWrite(operations);
  return result.modifiedCount;
}

async function backfillDiningHallTotalReviewCounts() {
  await DiningHall.updateMany({}, { $set: { totalReviewCount: 0 } });

  const menuItems = await MenuItem.find().select("_id hallName").lean();
  const hallReviewCounts = new Map();
  const itemToHall = new Map(
    menuItems.map((item) => [String(item._id), item.hallName])
  );

  const directHallCounts = await Review.aggregate([
    { $match: { hallId: { $exists: true, $ne: null } } },
    { $group: { _id: "$hallId", reviewCount: { $sum: 1 } } },
  ]);
  directHallCounts.forEach(({ _id, reviewCount }) => {
    hallReviewCounts.set(`id:${String(_id)}`, reviewCount);
  });

  const itemReviewCounts = await Review.aggregate([
    { $match: { itemId: { $exists: true, $ne: null } } },
    { $group: { _id: "$itemId", reviewCount: { $sum: 1 } } },
  ]);
  itemReviewCounts.forEach(({ _id, reviewCount }) => {
    const hallSlug = itemToHall.get(String(_id));
    if (hallSlug) {
      hallReviewCounts.set(
        `slug:${hallSlug}`,
        (hallReviewCounts.get(`slug:${hallSlug}`) || 0) + reviewCount
      );
    }
  });

  const halls = await DiningHall.find().select("_id slug").lean();
  const operations = halls.map((hall) => ({
    updateOne: {
      filter: { _id: hall._id },
      update: {
        $set: {
          totalReviewCount:
            (hallReviewCounts.get(`id:${String(hall._id)}`) || 0) +
            (hallReviewCounts.get(`slug:${hall.slug}`) || 0),
        },
      },
    },
  }));

  if (operations.length) {
    await DiningHall.bulkWrite(operations);
  }

  return operations.length;
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const menuItemsUpdated = await backfillModelStats(MenuItem, "itemId");
  const diningHallsUpdated = await backfillModelStats(DiningHall, "hallId");
  const diningHallTotalsUpdated = await backfillDiningHallTotalReviewCounts();

  console.log(`Updated ${menuItemsUpdated} menu items.`);
  console.log(`Updated ${diningHallsUpdated} dining halls.`);
  console.log(`Updated ${diningHallTotalsUpdated} dining hall total counts.`);
  console.log("Review statistics backfill complete.");
} catch (error) {
  console.error("Review statistics backfill failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
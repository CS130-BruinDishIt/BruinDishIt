import Review from "../models/Review.js";


export const getUserReviews = async (req, res) => {
  try {
    // You can pull the userId from the URL parameters (e.g., /api/reviews/user/:userId)
    // Or if you want the logged-in user to fetch their own posts, use req.user.id
    const { userId } = req.params; 

    if (!userId) {
      return res.status(400).json({ error: "User ID parameter is required." });
    }

    // Find all reviews matching the userId
    const reviews = await Review.find({ userId: userId })
      .populate("itemId", "name")   // Grabs just the 'name' of the MenuItem
      .populate("hallId", "name")   // Grabs just the 'name' of the DiningHall
      .sort({ date: -1 });          // Sorts by newest first

    // Even if the user has 0 reviews, returning an empty array [] is standard 
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews: reviews
    });

  } catch (error) {
    // Catch invalid MongoDB ObjectId formats cast errors cleanly
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid User ID format." });
    }
    res.status(500).json({ error: error.message || "Internal server error." });
  }
};
// Get all food categories
router.get("/getCategories", async (req, res) => {
  try {
    const collection = req.app.locals.db.collection('food_categories'); // make sure you have this collection
    const categories = await collection.find({}).toArray();
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

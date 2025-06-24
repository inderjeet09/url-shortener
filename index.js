// require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const path = require("path");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = process.env.PORT || 8001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/short-url";

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Connect to MongoDB
connectToMongoDB(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// API Routes
app.use("/url", urlRoute);

// Redirection Route
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } }
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error in redirect route:", error);
    res.status(500).send("Internal server error");
  }
});

// Start server
app.listen(PORT, () => console.log(`Server started at Port: ${PORT}`));

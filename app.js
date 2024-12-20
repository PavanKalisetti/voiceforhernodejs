require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Initialize express app
const app = express();

// Set up MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create a Schema and Model for the image data
const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
});

const Image = mongoose.model('Image', imageSchema);

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Route for uploading the image
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    // Save image data in MongoDB
    const image = new Image({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });

    await image.save();

    // Return the URL of the uploaded image
    res.json({ url: image.url });
  } catch (error) {
    res.status(500).send('Error saving image to database');
  }
});

// Set up server to listen on a port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");

const app = express();
const port = process.env.PORT || 8080;

// Azure Storage Configuration
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("✅ Server is running! Use /upload to upload files.");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(
      req.file.originalname
    );

    await blobClient.uploadData(req.file.buffer);

    res.status(200).send("File uploaded successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file");
  }
});

app.listen(port, "0.0.0.0", () =>
  console.log(`Server running on port ${port}`)
);

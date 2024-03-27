const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(bodyParser.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Replace '*' with the appropriate origin in production
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.post("/api/data", async (req, res) => {
  const url = req.body.url;
  try {
    console.log("url: ", url);
    const response = await axios.get(url);
    const urlHash = crypto.createHash("sha256").update(url).digest("hex");
    const outputFile = path.join("database", `${urlHash}.json`);
    const jsonString = JSON.stringify(response.data, null, 2);
    fs.writeFile(outputFile, jsonString, (err) => {
      if (err) {
        console.log("Error writing file:", err);
      } else {
        console.log(`Successfully wrote JSON data to ${outputFile}`);
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

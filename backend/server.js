const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const documentClient = require("./dynamodbClient");
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const TableName = "FeedTable";

const getHash = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

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
    const response = await axios.get(url);
    const urlHash = getHash(url);
    try {
      const pastData = fs.readFileSync(`database/${urlHash}.json`);
      res.send({ newData: response.data, pastData });
    } catch (err) {
      res.send({ newData: response.data, pastData: [] });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { record, identifier, outputJson, feed } = req.body;
    const urlHash = getHash(feed);
    const outputFile = path.join("database", `${urlHash}.json`);
    const jsonString = JSON.stringify(outputJson, null, 2);
    fs.writeFile(outputFile, jsonString, (err) => {
      if (err) {
        console.log("Error writing file:", err);
      } else {
        console.log(`Successfully wrote JSON data to ${outputFile}`);
      }
    });
    await documentClient.send(
      new PutCommand({
        TableName,
        Item: {
          feed,
          record,
          identifier,
        },
      })
    );
    res.send({ status: 200 });
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

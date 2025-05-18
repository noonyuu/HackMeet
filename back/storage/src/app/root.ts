import express from "express";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { Readable } from "stream";

import upload from "../multerHandler";
import { uploadMain } from "./minio";

require("dotenv").config();
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(logger("dev")); // 開発用にログの表示
app.use(express.json()); // application/jsonを扱えるようにする
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const s3 = new S3Client({
  region: "ap-northeast-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE }),
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
});

app.get("/ping", (_, req) => {
  req.json({ message: "connected from pictogram" });
});

app.post("/", upload.single("image"), async (req, res) => {
  const imagePath = req.file!.path;
  const uid = req.body.uid;

  if (!imagePath) {
    return res.status(400).send("No file uploaded");
  }
  if (!uid) {
    return res.status(400).send("No uid provided");
  }

  const fileName = req.file!.filename;

  try {
    const uploadPath = await uploadMain(imagePath, fileName, uid);
    if (!uploadPath) throw new Error("Upload failed");

    const s3Key = `${uid}/${fileName}`;

    res.status(200).json({
      key: s3Key,
    });
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    res.status(500).send("Error uploading image to S3");
  }
});

app.get("/get", async (req, res) => {
  console.log("GET request received");
  try {
    const date = req.query.date;

    if (typeof date !== "string" || !date) {
      res.status(400).send("Error: missing parameters");
      return;
    }

    const result = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: date,
      })
    );

    if (!result.Body) {
      res.status(500).send("Error: No response from S3");
      return;
    }

    const readableObj = result.Body as Readable;
    res.setHeader("Content-Type", result.ContentType || "image/png");
    res.setHeader("Content-Length", result.ContentLength as number);

    readableObj.pipe(res);

    readableObj.on("end", () => {
      console.log("Readable stream ended");
    });

    readableObj.on("error", (err) => {
      console.error("Error in readable stream:", err);
      res.status(500).send("Error in readable stream");
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error processing request");
  }
});

export default app;

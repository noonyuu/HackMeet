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

  // const fileName = req.file!.filename;
  // const category = req.body.category || "uncategorized";
  // const title = req.body.title;

  // try {
  //   const uploadPath = await uploadMain(imagePath, fileName, category);
  //   if (!uploadPath) throw new Error("Upload failed");

  //   const s3Key = `${category}/${fileName}`;

  //   res.send("Image uploaded successfully");
  // } catch (error) {
  //   console.error("Error uploading image to S3:", error);
  //   res.status(500).send("Error uploading image to S3");
  // }
});

export default app;

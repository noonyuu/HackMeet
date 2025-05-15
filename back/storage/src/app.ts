import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from 'cors';

require("dotenv").config();
const app = express();
const router = express.Router();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://pictogram.noonyuu.com'],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));

app.use(logger("dev")); // 開発用にログの表示
app.use(express.json()); // application/jsonを扱えるようにする
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

// 接続確認用
console.log("Hello World!!!");
app.get("/ping", (_, req) => {
  req.json({message: "connected"})
})

export default app;

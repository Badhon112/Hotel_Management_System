import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import Users from './routes/users'

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Database Connection Succefull");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/users",Users)

app.listen(7000, () => {
  console.log("Server running on Localhost : 7000");
});

import { Router } from "express";
import * as ReviewController from "../controllers/ReviewController.js";

export const ReviewRouter = Router();

ReviewRouter.post("/", ReviewController.CreateReview);

import { Router } from "express";
import * as CategoryController from "../controllers/CategoryController.js";

export const CategoryRouter = Router();

CategoryRouter.get("/", CategoryController.GetCategories);

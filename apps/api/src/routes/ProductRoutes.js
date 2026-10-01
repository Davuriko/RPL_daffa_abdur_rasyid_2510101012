import { Router } from "express";
import * as ProductController from "../controllers/ProductController.js";

export const ProductRouter = Router();

ProductRouter.get("/", ProductController.GetProducts);
ProductRouter.post("/", ProductController.CreateProduct);
ProductRouter.get("/:Id", ProductController.GetProduct);
ProductRouter.put("/:Id", ProductController.UpdateProduct);
ProductRouter.delete("/:Id", ProductController.DeleteProduct);

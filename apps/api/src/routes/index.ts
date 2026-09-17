import { Router } from "express";
import { StoreRouter } from "./StoreRoutes.js";
import { CategoryRouter } from "./CategoryRoutes.js";
import { ProductRouter } from "./ProductRoutes.js";
import { OrderRouter } from "./OrderRoutes.js";

export const ApiRouter = Router();

ApiRouter.use("/stores", StoreRouter);
ApiRouter.use("/categories", CategoryRouter);
ApiRouter.use("/products", ProductRouter);
ApiRouter.use("/orders", OrderRouter);

import { Router } from "express";
import { StoreRouter } from "./StoreRoutes.js";
import { CategoryRouter } from "./CategoryRoutes.js";
import { ProductRouter } from "./ProductRoutes.js";
import { OrderRouter } from "./OrderRoutes.js";
import { AuthRouter } from "./AuthRoutes.js";
import { AdminRouter } from "./AdminRoutes.js";

export const ApiRouter = Router();

ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/admin", AdminRouter);
ApiRouter.use("/stores", StoreRouter);
ApiRouter.use("/categories", CategoryRouter);
ApiRouter.use("/products", ProductRouter);
ApiRouter.use("/orders", OrderRouter);

import { Router } from "express";
import * as StoreController from "../controllers/StoreController.js";
import * as OrderController from "../controllers/OrderController.js";
import * as DashboardController from "../controllers/DashboardController.js";

export const StoreRouter = Router();

StoreRouter.get("/", StoreController.GetStores);
StoreRouter.post("/", StoreController.CreateStore);
StoreRouter.get("/:Id", StoreController.GetStore);
StoreRouter.put("/:Id", StoreController.UpdateStore);
StoreRouter.patch("/:Id/toggle-status", StoreController.ToggleStoreStatus);
StoreRouter.get("/:StoreId/orders", OrderController.GetStoreOrders);
StoreRouter.get("/:StoreId/dashboard", DashboardController.GetDashboard);

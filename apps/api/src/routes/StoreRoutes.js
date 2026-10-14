import { Router } from "express";
import { Role } from "@kampus-bite/shared";
import * as StoreController from "../controllers/StoreController.js";
import * as OrderController from "../controllers/OrderController.js";
import * as DashboardController from "../controllers/DashboardController.js";
import { RequireAuth, RequireRole } from "../middleware/Auth.js";

export const StoreRouter = Router();

StoreRouter.get("/", StoreController.GetStores);
StoreRouter.get(
  "/mine",
  RequireAuth,
  RequireRole(Role.Seller),
  StoreController.GetMyStores,
);
StoreRouter.post(
  "/",
  RequireAuth,
  RequireRole(Role.Seller),
  StoreController.CreateStore,
);
StoreRouter.get("/:Id", StoreController.GetStore);
StoreRouter.put("/:Id", StoreController.UpdateStore);
StoreRouter.patch("/:Id/toggle-status", StoreController.ToggleStoreStatus);
StoreRouter.get("/:StoreId/orders", OrderController.GetStoreOrders);
StoreRouter.get("/:StoreId/dashboard", DashboardController.GetDashboard);

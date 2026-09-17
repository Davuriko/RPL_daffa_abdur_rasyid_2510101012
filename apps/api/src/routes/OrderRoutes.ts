import { Router } from "express";
import * as OrderController from "../controllers/OrderController.js";

export const OrderRouter = Router();

OrderRouter.get("/", OrderController.GetCustomerOrders);
OrderRouter.post("/", OrderController.CreateOrder);
OrderRouter.patch("/:Id/status", OrderController.UpdateOrderStatus);

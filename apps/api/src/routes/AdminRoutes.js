import { Router } from "express";
import { Role } from "@kampus-bite/shared";
import * as AdminController from "../controllers/AdminController.js";
import { RequireAuth, RequireRole } from "../middleware/Auth.js";

export const AdminRouter = Router();

AdminRouter.use(RequireAuth, RequireRole(Role.Admin));

AdminRouter.get("/stats", AdminController.GetStats);
AdminRouter.get("/users", AdminController.GetUsers);
AdminRouter.get("/stores", AdminController.GetStores);
AdminRouter.patch("/stores/:Id/verification", AdminController.SetStoreVerification);

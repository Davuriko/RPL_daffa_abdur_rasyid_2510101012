import { Router } from "express";
import * as AuthController from "../controllers/AuthController.js";
import { RequireAuth } from "../middleware/Auth.js";

export const AuthRouter = Router();

AuthRouter.post("/register", AuthController.Register);
AuthRouter.post("/login", AuthController.Login);
AuthRouter.get("/me", RequireAuth, AuthController.Me);

// backend/src/routes/authRoute.js

import express from "express";
import {
  signUp,
  signIn,
  signOut,
  refresh,
  verifyEmail,
  signUpPrinter,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes for authentication
router.post("/signup", signUp);
router.post("/signup-printer", signUpPrinter);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);

export default router;

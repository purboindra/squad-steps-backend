import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { generateTokenSchema, rotateTokenSchema } from "../schemas/token.schema";
import { validate } from "../schemas/validate";

const router = Router();

router.post(
  "/tokens",
  validate({
    body: generateTokenSchema,
  }),
  authController.generateToken,
);

router.post(
  "/refresh-token",
  validate({
    body: rotateTokenSchema,
  }),
  authController.rotateToken,
);

export default router;

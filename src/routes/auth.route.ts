import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { generateTokenSchema } from "../schemas/token.schema";
import { validate } from "../schemas/validate";

const router = Router();

router.post(
  "/tokens",
  validate({
    body: generateTokenSchema,
  }),
  authController.generateToken,
);

export default router;

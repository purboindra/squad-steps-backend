import { Router } from "express";
import * as controller from "../controllers/registration.controller";
import { registerOptionsSchema } from "../schemas/registerOptions.schema";
import { validate } from "../schemas/validate";

const router = Router();

router.post(
  "/register/options",
  validate({
    body: registerOptionsSchema,
  }),
  controller.generateRegisterOptions,
);

router.post(
  "/register/verify",
  validate({
    body: registerOptionsSchema,
  }),
  controller.verifyRegisterOptions,
);

export default router;

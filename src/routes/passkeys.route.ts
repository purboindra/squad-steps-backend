import { Router } from "express";
import * as controller from "../controllers/passkeys.controller";
import { verifyResponseAuthOptionsSchema } from "../schemas/auth.schema";
import { emailSchema } from "../schemas/passkeys.schema";
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
  "/generate/options",
  validate({
    body: emailSchema,
  }),
  controller.generateAuthOptions,
);

router.post(
  "/get/options",
  validate({
    body: emailSchema,
  }),
  controller.getPasskeyOptions,
);

router.post(
  "/verify/response",
  validate({
    body: verifyResponseAuthOptionsSchema,
  }),
  controller.verifyAuthResponse,
);

export default router;

import { Router } from "express";
import * as userController from "../controllers/users.controller";
import { verifyRegisterOptionsSchema } from "../schemas/user.schema";
import { validate } from "../schemas/validate";

const router = Router();

router.post(
  "/",
  validate({
    body: verifyRegisterOptionsSchema,
  }),
  userController.registerUser,
);

export default router;

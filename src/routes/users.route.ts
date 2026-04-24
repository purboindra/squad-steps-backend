import { Router } from "express";
import * as userController from "../controllers/users.controller";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware";
import { idSchema } from "../schemas/helper.schema";
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

router.delete("/:id", authenticateMiddleware, validate({ params: idSchema }), userController.deleteUser);

router.get("/", authenticateMiddleware, userController.getAllUsers);

export default router;

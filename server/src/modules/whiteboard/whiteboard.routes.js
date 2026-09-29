import { Router } from "express";

import whiteboardController from "./whiteboard.controller.js";
import { saveWhiteboardSchema } from "./whiteboard.validation.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

const router = Router();

router.get(
  "/:classId",
  authenticate,
  authorize("TEACHER", "STUDENT"),
  whiteboardController.getWhiteboard
);

router.put(
  "/:classId",
  authenticate,
  authorize("TEACHER"),
  validate(saveWhiteboardSchema),
  whiteboardController.saveWhiteboard
);

export default router;
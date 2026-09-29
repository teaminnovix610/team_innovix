import { Router } from "express";

import playlistController from "./playlist.controller.js";

import authenticate from "../../shared/middleware/authenticate.middleware.js";
import authorize from "../../shared/middleware/authorize.middleware.js";
import validate from "../../shared/middleware/validate.middleware.js";

import { createPlaylistSchema, updatePlaylistSchema, reorderPlaylistSchema } from "./playlist.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TEACHER"),
  validate(createPlaylistSchema),
  playlistController.create
);

router.get(
  "/batch/:batchId",
  authenticate,
  authorize("TEACHER", "STUDENT", "ADMIN"),
  playlistController.batchPlaylists
);

router.get(
  "/:id",
  authenticate,
  authorize("TEACHER", "STUDENT", "ADMIN"),
  playlistController.getById
);
router.patch(
  "/:id/reorder",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validate(reorderPlaylistSchema),
  playlistController.reorder
);

router.patch(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validate(updatePlaylistSchema),
  playlistController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  playlistController.remove
);

export default router;
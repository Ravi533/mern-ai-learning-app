import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.patch("/:id",authMiddleware, updateTask);
router.delete("/:id",authMiddleware, deleteTask);

export default router;

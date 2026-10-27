import Task from "../models/Task.js";
import AppError from "../util/appError.js";
import asyncHandler from "../util/asyncHandler.js";

const getTasks = asyncHandler(async (req, res) => {
  const { completed, search ,page = 1, limit = 10} = req.query;
  console.log("Logged-in user:", req.user);
  const pageNumber = Number(page);
const limitNumber = Number(limit);

if (
  Number.isNaN(pageNumber) ||
  pageNumber < 1 ||
  Number.isNaN(limitNumber) ||
  limitNumber < 1 ||
  limitNumber > 100
) {
  throw new AppError(
    "Page must be >= 1 and limit must be between 1 and 100",
    400
  );
}
  let filter = {};

  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }
  const skip = (pageNumber - 1) * limitNumber;
  filter.owner = req.user.userId;

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(limitNumber);

    const totalTasks = await Task.countDocuments(filter);

    const totalPages = Math.ceil(totalTasks / limitNumber);
  
    res.json({
      tasks,
      page: Number(pageNumber),
      limit: Number(limitNumber),
      totalTasks,
      totalPages,
    });
});

const createTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const task = await Task.create({
    title,
    owner: req.user.userId,
  });
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      owner: req.user.userId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json(task);
});

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

export { getTasks, createTask, updateTask, deleteTask };

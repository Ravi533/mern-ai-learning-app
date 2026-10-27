import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "Title is required",
        minlength: [3, "Title must be at least 3 characters"],
        maxlength: [100, "Title cannot exceed 100 characters"],
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
})

const Task = mongoose.model("Task",taskSchema);

export default Task
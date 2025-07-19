import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["task", "bug", "story", "epic"], default: "task" },
  status: { type: String, enum: ["backlog", "todo", "in_progress", "in_review", "done"], default: "backlog" },
  priority: { type: String, enum: ["lowest", "low", "medium", "high", "highest"], default: "medium" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Issue", issueSchema);

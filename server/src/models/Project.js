import mongoose from 'mongoose';

export const PROJECT_ROLES = ['admin', 'member', 'viewer'];

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
    },
    description: { type: String, default: '' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: PROJECT_ROLES, default: 'member' },
      },
    ],
    archived: { type: Boolean, default: false },
    nextIssueNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

projectSchema.methods.getMemberRole = function (userId) {
  if (this.lead.toString() === userId.toString()) return 'admin';
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

projectSchema.methods.getNextIssueNumber = async function () {
  const number = this.nextIssueNumber;
  this.nextIssueNumber += 1;
  await this.save();
  return number;
};

projectSchema.methods.getIssueKey = async function (issueNumber) {
  return `${this.key}-${issueNumber}`;
};

const Project = mongoose.model('Project', projectSchema);
export default Project;

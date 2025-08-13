import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    avatarColor: { type: String, default: '#0052CC' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const AVATAR_COLORS = ['#0052CC', '#00B8D9', '#36B37E', '#FF8B00', '#FF5630', '#6554C0', '#FF991F', '#00875A', '#BF2600', '#5243AA', '#403294', '#0747A6'];

userSchema.statics.getRandomColor = function () {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

const User = mongoose.model('User', userSchema);
export default User;

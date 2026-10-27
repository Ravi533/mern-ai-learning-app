import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
    // Password hasn't changed, so don't hash it again
    if (!this.isModified("password")) {
      return next();
    }
  
    // Generate password hash
    this.password = await bcrypt.hash(this.password, 10);
  
    next();
  });

const User = mongoose.model("User", userSchema);

export default User;
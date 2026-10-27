import User from "../models/User.js";
import AppError from "../util/appError.js";
import asyncHandler from "../util/asyncHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {
    const { name, password, email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }
  
    const user = await User.create({
      name,
      email,
      password,
    });
  
    const userResponse = user.toObject();

    delete userResponse.password;
    
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  });
  

  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
  
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );
  
    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }
  
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      res.json({
        message: "Login successful",
        token,
      });
  });


  const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
  
    if (!user) {
      throw new AppError("User not found", 404);
    }
  
    res.json({
      user,
    });
  });

  export {register, login, getMe}
  
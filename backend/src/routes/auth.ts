import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db"; 
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


authRouter.post("/signup", async (req:Request, res:Response):Promise<any> => {
  try {
    const { name, email, password } = req.body;

    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });

    return res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/login", async (req:Request, res:Response):Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
  })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token here (if needed)
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      expires: new Date(Date.now() + 86400000),
    });

    return res.status(200).json({ message: "Login successful", user });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.send("Logged out successfully");
  } catch (error) {
    console.log(error);
  }
});

export default authRouter;

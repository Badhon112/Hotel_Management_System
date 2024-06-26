import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import User from "../models/user";
import { verifyToken } from "../middleware/auth";
const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// /api/users/register

router.post(
  "/register",
  [
    check("firstName", "First Name is Required").isString(),
    check("lastName", "First Name is Required").isString(),
    check("email", "Email is Required").isEmail(),
    check(
      "password",
      "Password with 6 or more characters is Required"
    ).isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    //Error from Validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }

    try {
      let user = await User.findOne({
        email: req.body.email,
      });
      if (user) {
        return res.status(400).json({ msg: "User Already exists" });
      }
      const { email, password, firstName, lastName } = await req.body;

      const hashedpassword = await bcrypt.hash(password, 8);

      user = new User({ email, password: hashedpassword, firstName, lastName });
      await user.save();
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      return res.status(200).send({ msg: "User Registerd Ok" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Some thing went wrong" });
    }
  }
);

export default router;

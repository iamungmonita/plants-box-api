import { Response, Request, NextFunction } from "express";
import { User } from "../models/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setCookie } from "../utils/cookie";
import { config } from "../config/config"; // Import the config file
import { saveBase64Image } from "..";
import { initialCount } from "./log";

declare global {
  namespace Express {
    export interface Request {
      admin?: string | JwtPayload; // Adjust type as per your needs
    }
  }
}

class TokenClass {
  id: string;
  firstName: string;
  lastName: string;

  constructor(id: string, firstName: string, lastName: string) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
  }

  generateToken = (secretKey: string) => {
    const token = jwt.sign(
      { id: this.id, firstName: this.firstName, lastName: this.lastName },
      secretKey,
      {
        expiresIn: config.tokenExpiration,
      }
    );
    return token;
  };
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName,
    lastName,
    role,
    codes,
    email,
    password,
    phoneNumber,
    isActive,
    createdBy,
    pictures,
  } = req.body;
  try {
    if (!createdBy) {
      res.status(401).json({ message: "unauthorized personnel." });
      return;
    }
    if (
      !firstName ||
      !lastName ||
      !role ||
      !email ||
      !password ||
      !phoneNumber ||
      !codes
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let savedImages = "";

    if (pictures && pictures !== "") {
      savedImages = await saveBase64Image(pictures, `product_${Date.now()}`);
    }
    const user = await User.create({
      email,
      phoneNumber,
      firstName,
      lastName,
      role,
      password: hashedPassword,
      isActive,
      codes,
      pictures: savedImages,
      createdBy,
    });

    if (!user) {
      res.status(400).json({ message: "Error creating user." });
      return;
    }

    res.status(200).json({ data: user });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      res.status(400).json({
        name: "email",
        message: `This email already registered`,
      });
      return;
    } else {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const admin = await User.findOne({ email });
    if (!admin) {
      res.status(401).json({ name: "email", message: "Cannot find the admin" });
      return;
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      res
        .status(401)
        .json({ name: "password", message: "The password does not match" });
      return;
    }
    const count = await initialCount(admin._id.toString());
    const token = new TokenClass(
      admin._id.toString(),
      admin.firstName,
      admin.lastName
    ).generateToken(config.secretKey);

    setCookie(res, config.authTokenName, token, {
      maxAge: config.tokenExpiration,
    });
    const data = {
      admin,
      count,
    };

    res.status(200).json({ data: data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during sign-in:", {
        message: error.message,
        stack: error.stack,
        email,
        time: new Date().toISOString(),
      });
    } else {
      console.error("An unknown error occurred:", error);
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = async (req: Request, res: Response): Promise<void> => {
  try {
    setCookie(res, config.authTokenName, "", { maxAge: 0 });
    res.status(200).json({ message: "sign out successfully" });
    return;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authTokenName = process.env.AUTH_TOKEN || "auth_token";
  const token = req.cookies?.[authTokenName];
  if (!token) {
    res.status(401).json({ message: "No authentication token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.secretKey);

    if (typeof decoded === "object" && "id" in decoded) {
      req.admin = decoded.id; // Attach decoded token payload to `req.admin`
    }
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export const fetchProfile = async (req: Request, res: Response) => {
  const admin = await User.findById(req.admin);
  if (!admin) {
    res.status(401).json({ message: "cannot find admin" });
    return;
  }
  res.status(200).json({ data: admin });
  return;
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(400).json({ message: "ID is required." });
      return;
    }
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: "User does not exist." });
      return;
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { createdBy, pictures, password, ...data } = req.body;
    const user = await User.findById(id);

    if (!createdBy) {
      res.status(200).json({ message: "Unauthorized personnel." });
      return;
    }
    if (!user) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const updateData = { ...data };
    if (createdBy) {
      updateData.updatedBy = createdBy; // Explicitly include createdBy
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword; // Update the password with the hashed value
    }
    if (pictures === null || pictures === "") {
      updateData.pictures = null; // Explicitly clear the pictures field
    } else if (pictures && pictures.startsWith("data:image")) {
      const savedImage = await saveBase64Image(
        pictures,
        `product_${Date.now()}`
      );
      updateData.pictures = savedImage; // Update with the new image
    } else {
      updateData.pictures = pictures;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (updatedUser) {
      res.status(200).json({ success: true, data: updatedUser });
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

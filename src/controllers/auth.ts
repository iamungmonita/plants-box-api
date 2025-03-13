import { Response, Request, NextFunction } from "express";
import { User } from "../models/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setCookie } from "../utils/cookie";
import { config } from "../config/config"; // Import the config file

declare global {
  namespace Express {
    export interface Request {
      admin?: string | JwtPayload; // Adjust type as per your needs
    }
  }
}

class ClassToken {
  id: string;
  firstname: string;
  lastname: string;

  constructor(id: string, firstname: string, lastname: string) {
    this.id = id;
    this.lastname = lastname;
    this.firstname = firstname;
  }

  generateToken = (secretKey: string) => {
    const token = jwt.sign(
      { id: this.id, firstname: this.firstname, lastname: this.lastname },
      secretKey,
      {
        expiresIn: config.tokenExpiration,
      }
    );
    return token;
  };
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { firstname, lastname, role, email, password } = req.body;
  try {
    if (!firstname || !lastname || !role || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const username = firstname + lastname;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      email,
      firstname,
      lastname,
      role,
      password: hashedPassword,
    });

    const token = new ClassToken(
      admin._id.toString(),
      admin.firstname,
      admin.lastname
    ).generateToken(config.secretKey);

    setCookie(res, config.authTokenName, token, {
      maxAge: config.tokenExpiration,
    });
    res.status(200).json({ message: "Created successfully", admin });
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
    } else {
      res.status(500).json({ message: "Internal server error" });
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

    const token = new ClassToken(
      admin._id.toString(),
      admin.firstname,
      admin.lastname
    ).generateToken(config.secretKey);

    setCookie(res, config.authTokenName, token, {
      maxAge: config.tokenExpiration,
    });

    res.status(200).json({ message: "Logged in successfully", admin });
  } catch (error: unknown) {
    // Explicitly typing error as `unknown`
    // Type assertion to `Error`
    if (error instanceof Error) {
      console.error("Error during sign-in:", {
        message: error.message,
        stack: error.stack,
        email, // Log the email that was attempted (avoid logging passwords)
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
  const token = req.cookies?.["f1ee97b19e11145c6fba1be1f8204e00"];
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
  res.status(200).json({ message: "this user has the access", admin });
  return;
};

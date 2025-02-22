const cookie = require("cookie");
import { Response } from "express";

/**
 * Utility function to set a cookie.
 * @param res - The HTTP response object.
 * @param name - The name of the cookie.
 * @param value - The value of the cookie.
 * @param options - Additional options for the cookie.
 */
export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: any // `cookie.serialize` options are not strongly typed with `require`
) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(name, value, {
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      ...options,
    })
  );
};

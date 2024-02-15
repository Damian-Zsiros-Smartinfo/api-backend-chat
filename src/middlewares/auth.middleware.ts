import { User } from "../entities/User";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
interface HeadersRoute {
  Authorization: string;
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const authHeaderString = authHeader?.toString() || "";
    if (!authHeader)
      res.status(400).json({
        error: { message: "Token must be provided" },
      });
    if (!process.env.NEXT_PUBLIC_JWT_SECRET_KEY)
      throw new Error("Secret key not set");
    const token = jwt.verify(
      authHeaderString,
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY
    );

    if (token == null) {
      res.status(401).json({ message: "Token is not valid" });
    }

    const userInfoToken = jwt.verify(
      authHeaderString,
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY
    ) as User;
    if (!userInfoToken.id) {
      res.status(401).json({ message: "Token is not valid" });
    }
    const userExists =
      (
        await User.getRepository().findBy({
          id: userInfoToken.id,
        })
      ).length > 0;

    if (!userExists) {
      res.status(401).json({ message: "Token is not valid" });
    }

    next();
  } catch (error) {
    if (error instanceof Error)
      res.status(500).json({ error: { message: error.message } });
  }
}

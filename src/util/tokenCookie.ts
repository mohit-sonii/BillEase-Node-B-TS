import jwt from "jsonwebtoken";
import { Response } from "express";
import { prisma } from "../client";

const secret = process.env.SECRET_KEY || "JavaPythonRustRubyFlaskCos";

export const generateToken = (res: Response, id: string, username: string) => {
   const token = jwt.sign({ id, username }, process.env.SECRET_KEY || secret, {
      algorithm: "ES256",
      expiresIn: "24h",
   });
   addCookie(res, token);
};

interface JWT {
   id: string;
   username: string;
}

export const validateToken = async (token: string) => {
   const decode = jwt.verify(token, process.env.SECRET_KEY || secret) as JWT;
   const user = await prisma.user.findFirst({
      where: {
         user_id: decode.id,
      },
      select: {
         user_id: true,
         username: true,
      },
   });
   if (user == null) return false;
   return true;
};

export const addCookie = (res: Response, token: string) => {
   res.cookie("auth_for_book", token, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 1000 * 24 * 60 * 60,
   });
};

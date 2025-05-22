import jwt from "jsonwebtoken";
import { Response } from "express";
import { prisma } from "../client";

const secret = process.env.SECRET_KEY || "JavaPythonRustRubyFasdfasdfsfdsdflaskCos";

// generate a token
export const generateToken = (res: Response, id: string, username: string) => {
   const token = jwt.sign({ id, username }, secret, {
      expiresIn: "24h",
   });
   res.cookie("auth_for_book", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 24 * 60 * 60,
   });
};

export interface JWT {
   id: string;
   username: string;
}

// validate a token
export const validateToken = async (token: string) => {
   const decode = jwt.verify(token, process.env.SECRET_KEY || secret) as JWT;
   const user = await prisma.users.findFirst({
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

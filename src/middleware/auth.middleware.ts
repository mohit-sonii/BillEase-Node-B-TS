import { NextFunction, Request, Response } from "express";
import { validateToken } from "../util/tokenCookie";

export const authMiddleware = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const token = req.cookies?.auth_for_book;
      if (!token) {
         res.status(401).json({ status: 401, message: "Unauthorized" });
         return;
      }
      try {
         const isValid = await validateToken(token);
         if (!isValid) {
            res.status(401).json({ status: 401, message: "Unauthorized" });
            return;
         }
      } catch (err) {
         res.status(400).json({ status: 400, message: "Something went wrong" });
         return;
      }
      next();
   } catch (error: any) {
      res.status(500).json({ status: 500, message: "UnExpected Server Error" });
      console.log(error);
      return;
   }
};

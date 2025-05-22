import { NextFunction, Request, Response } from "express";
import { validateToken } from "../util/tokenCookie";

/*
   • Check whether the user has token or not, if not theat means it is trying to reach the protecteed route and does not have token means its unauthoixed, do not let him go next
   •  If present validate it, if false do what has done before
   • Else it has token and its verified let him go where ever he wants. call next method so that the next method which is mentioned after the usage ofthis route cna be called.
*/
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

import { Request, Response } from "express";
import { generateToken, validateToken } from "../util/tokenCookie";
import bcrypt from "bcrypt";
import { prisma } from "../client";

export const login = async (req: Request, res: Response) => {
    try {
        const cooki = req.cookies?.auth_for_book;
        if (cooki) {
            const validate = await validateToken(cooki);
            if (validate) {
                res.status(302).json({ status: 302, redirect: "/books" });
                return;
            }
        }
        const { username, password } = req.body;
        if (username.isEmpty() || password.isEmpty()) {
            res.status(400).json({
                status: 400,
                message: "Fields cannot be empty",
            });
        }
        const user = await prisma.user.findFirst({
            where: {
                username,
            },
            select: {
                user_id: true,
                username: true,
                password: true,
            },
        });
        if (user == null) {
            res.status(404).json({ status: 404, message: "User not found" });
            return;
        }
        if (await bcrypt.compare(password, user.password)) {
            generateToken(res, user.user_id, user.username);
        } else {
            res.status(400).json({
                status: 400,
                message: "Either user name or password is incorrect",
            });
        }
        return;
    } catch (error: any) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
        console.log(error);
        return;
    }
};

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                username,
            },
            select: {
                username: true,
            },
        });
        if (user != null) {
            res.status(302).json({ status: 302, message: "User Already Exists" });
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        try {
            await prisma.user.create({
                data: {
                    username,
                    password: hashPassword,
                },
            });
            res.status(201).json({ status: 201, message: "User is Created" });
            return
        } catch (error) {
            res.status(400).json({
                status: 400,
                message: "Error while creating a user",
            });
            console.log(error);
            return;
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
        console.log(error);
        return;
    }
};

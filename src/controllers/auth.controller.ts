import { Request, Response } from "express";
import { generateToken, validateToken } from "../util/tokenCookie";
import bcrypt from "bcrypt";
import { prisma } from "../client";

// login controller that is responsible to handle the login logic
/*
    • Check whether the browser has token or not 
    • If yes, then validate it and if it is valid then return the redirection code
    • Take username and password and from body
    • find whether we have that user or not
    • if not then return no user found
    • if found compare the password
    • if match generate a token and store it in cookie
*/

// First register your self then login to get a token access , you will not be authenicate unlsess you login after register

export const login = async (req: Request, res: Response):Promise<void> => {
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
        if (username.length == 0 || password.length == 0) {
            res.status(400).json({
                status: 400,
                message: "Fields cannot be empty",
            });
            return
        }
        const user = await prisma.users.findFirst({
            where: {
                username: username,
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
            res.status(200).json({status:200,message:"User Logged in"})
            return
        }
        res.status(400).json({
            status: 400,
            message: "Either user name or password is incorrect",
        });

        return;
    } catch (error: any) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
        console.log(error);
        return;
    }
};

/*
    • Take the username and password from body
    • find the user and if a user found then return hence the user will same username already existis
    • hash teh password
    • store the user and generate a token adn store it on cookie
*/

export const signup = async (req: Request, res: Response):Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await prisma.users.findFirst({
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
            await prisma.users.create({
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

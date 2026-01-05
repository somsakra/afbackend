import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../middleware/authentication.js";


const userRouter = Router();

userRouter.get("/:id", authenticateToken, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: (req.params.id)
        }
    });
    if (!user) {
        res.status(404).json({ message: "User not found" })
        return
    }
    res.json({ name: user.name, email: user.email });
})

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body
        const userExists = await prisma.user.findUnique({
            where: {
                email
            }
        })
        //Check user exists
        if (!userExists) {
            res.status(404).json({ message: "User not found" })
            return
        }
        //Verify password
        const passwordValid = await argon2.verify(userExists.password, password)
        if (!passwordValid) {
            res.status(401).json({ message: "Invalid password" })
            return
        }
        //Generate JWT token
        const token = jwt.sign(
            { userId: userExists.id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "1h" }
        )
        const userWithToken = { id: userExists.id, name: userExists.name, email: userExists.email, token }
        res.json(userWithToken)
    } catch (error) {
        res.status(500).json({ message: error })
    }
})

userRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        //Get Request body
        const { name, email, password } = req.body
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { name }]
            },
        })
        //Check user exists
        if (userExists) {
            res.status(400).json({ message: "username or email is already exists" })
            return
        }
        //Hash password
        const hash = await argon2.hash(password);
        //Add new user to database
        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.name,
                password: hash
            }
        })
        res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email })

    } catch (error) {
        res.status(500).json({ message: error })
    }
})

export default userRouter
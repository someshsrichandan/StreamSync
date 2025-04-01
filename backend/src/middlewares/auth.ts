import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import prisma from '../config/db';

dotenv.config();

export const userAuth = async ( req:Request , res:Response , next:NextFunction) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        const { email } = decoded as { email: string };

        const user = await prisma.user.findFirst({
          where: {
            email,
            admin: false, // ensure it's a normal user
          },
        });
        (req as Request & { user?: typeof user }).user = user;
        next();
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });   
    }
}

export const admin = async ( req:Request , res:Response , next:NextFunction) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        const { email } = decoded as { email: string };

        const user = await prisma.user.findFirst({
          where: {
            email,
            admin: true, // ensure it's a admin user
          },
        });
        (req as Request & { user?: typeof user }).user = user;
        next();
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });   
    }
}

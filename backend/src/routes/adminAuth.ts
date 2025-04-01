import express , {Request , Response} from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const adminAuthRouter = express.Router();

const secretAdmin = process.env.ADMIN_SECRET;

adminAuthRouter.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password , secret} = req.body;

    const userExist = await prisma.user.findUnique({
      where: { email },
    });
    console.log(secretAdmin , secret)
    if(secret !== secretAdmin) {
      return res.status(400).json({ message: 'You are not authorized to create an admin user' });
    }
    if (userExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        admin: true,
        password: hashPassword,
         // Set admin to true for this user
      },
    });

    return res.status(201).json({ message: 'User created', user });
  }
  catch (error) {   
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

adminAuthRouter.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if(user.admin !== true) {
      return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1d',
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 86400)
    });

    return res.status(200).json({ message: 'Login successful', token });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

adminAuthRouter.post('/logout', async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default adminAuthRouter;


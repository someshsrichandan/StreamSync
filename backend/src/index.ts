import express , {Express} from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminAuthRouter from "./routes/adminAuth";
import streamingRouter from "./routes/streaming";

dotenv.config();
const app:Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/" , authRouter)
app.use("/api/admin/" , adminAuthRouter)
app.use("/api/streaming/" , streamingRouter)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    });
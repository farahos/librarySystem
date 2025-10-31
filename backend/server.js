import express from 'express';
import { connect } from 'mongoose';
import conectBD from './config/db.js';
import { registerUser } from './controller/UserController.js';
import userRouter from './routes/UserRoute.js';
import postRouter from './routes/PostRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();
const PORT = 8000


app.use(cors({
  origin: 'https://http://localhost:5173', // frontend origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // haddii aad isticmaalayso cookies / credentials
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/post', postRouter);

conectBD();
app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);

})

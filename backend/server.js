import express from 'express';
import { connect } from 'mongoose';
import conectBD from './config/db.js';
import { registerUser } from './controller/UserController.js';
import userRouter from './routes/UserRoute.js';
import postRouter from './routes/PostRoute.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 8000

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/post', postRouter);

conectBD();
app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);

})

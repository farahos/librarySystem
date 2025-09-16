import express from "express";
import { createPost, getPosts } from "../controller/postController.js";
import { authenticate } from "../middleware/authmiddleware.js";
import upload, { uploadFields } from "../middleware/upload.js"
const postRouter = express.Router();

postRouter.post('/createPost', authenticate, uploadFields, createPost);
postRouter.get('/getPosts', authenticate, getPosts);


export default postRouter;
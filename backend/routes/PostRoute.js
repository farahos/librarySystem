import express from "express";
import { createPost, getPosts } from "../controller/postController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import upload, { uploadFields } from "../middleware/upload.js"
const postRouter = express.Router();

postRouter.post('/createPost', authenticate , authorizeRoles("admin"), uploadFields, createPost);
postRouter.get('/getPosts', getPosts);


export default postRouter;
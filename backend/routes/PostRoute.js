import express from "express";
import { createPost, deletePost, getPostById, getPosts, updatePost } from "../controller/postController.js";
import { authenticate, authorizeRoles } from "../middleware/authmiddleware.js";
import upload, { uploadFields } from "../middleware/upload.js"
const postRouter = express.Router();

postRouter.post('/createPost', authenticate , authorizeRoles("admin"), uploadFields, createPost);
postRouter.put('/:id', authenticate , authorizeRoles("admin"), uploadFields, updatePost);
postRouter.delete('/:id', authenticate , authorizeRoles("admin"), deletePost);
postRouter.get('/getPosts', getPosts);
postRouter.get('/getPost', getPostById);

//single post 





export default postRouter;
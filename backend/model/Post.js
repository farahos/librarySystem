import mongoose from "mongoose";

const postschema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image : {
        type: String,
        default: null
    },
    pdf: {                       // field cusub oo PDF link ah
        type: String,
        default: null
    },
    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }         
});

const Post = mongoose.model("Post", postschema);
export default Post;

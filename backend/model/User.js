import mongoose from "mongoose";

import bcrypt from "bcrypt";
import { compare } from "bcrypt";
const userschema = mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select : false

    }
    
},
{
    timestamps: true
});
userschema.pre("save", async function(next){
    if(!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

    

})
userschema.methods.comparePassword = async function(givenpassword){
    return await bcrypt.compare(givenpassword, this.password);
}
const User = mongoose.model("User", userschema);
export default User;
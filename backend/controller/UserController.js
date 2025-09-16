import { jwt_secret } from "../config/config.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {
    try{

        const {email, username, password} = req.body;
      
        const existingUser = await User.findOne({
            $or : [
                {email: email.toLowerCase()},
                {username: username.toLowerCase()}

            ]
        });
        if(existingUser) {
            return res.status(400).send({message: "User already exists"});
        }
        const userInfo = new User({
            email: email,
            username: username,
            password: password
        })
        await userInfo.save();
        res.status(201).send({message: "User registered successfully"});

    }catch(error) {
        console.error("Error in registering user:", error);
        res.send({message: "Error in registering user"});
        

    }
}
export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        const isuserExist = await User.findOne({email: email.toLowerCase()})
        .select("+password");
        if(!isuserExist) {
            return res.status(400).send("User does not exist");
        }

        const ispasswordCorrect = await isuserExist.comparePassword(password);

        if(!ispasswordCorrect) {
            return res.status(400).send("Invalid password");
        }
        // // Token generation for user
        const expirein  = 7 * 24 * 60 * 60 * 1000; // 7 days
        // const token = jwt.sign({ _id: isuserExist._id}, jwt_secret, {expirein});
        const token = jwt.sign({ _id: isuserExist._id}, jwt_secret, {expiresIn: expirein});
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: expirein * 1000 // Convert to milliseconds

        });

        res.status(200).send({...isuserExist.toJSON(), expirein});

    }catch(error){
        console.log("Error in logging in user:", error);
        res.status(400).send({message: "Error in logging in user"});
    }
}
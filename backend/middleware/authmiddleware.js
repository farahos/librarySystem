import jwt from 'jsonwebtoken';
import { jwt_secret } from '../config/config.js';
export const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Mytoken", token)
    if(!token) return res.status(401).send("Access Denied. No token provided");

    try {
        const decoded = jwt.verify(token, jwt_secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send("Invalid token");
    }
}
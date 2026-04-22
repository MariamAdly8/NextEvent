import User from "../models/userModel.js";
import HTTPError from "../utils/HTTPError.js";
import jwt from 'jsonwebtoken'
export const authentication= async (req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new HTTPError(401, "No token provided or invalid format"));
        }
        const token=authHeader.split(" ")[1];
        if(!token)
            return next(new HTTPError(401,"No token provided"));

        let payload;
        try{
            payload=jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        }catch(err){
            return next(new HTTPError(401, "Invalid or expired token"));
        }
        const user=await User.findById(payload.userId);
        if(!user)
            return next(new HTTPError(401, "Not authorized, user no longer exists"));
        req.user=user;
        next();
    }
    catch(err){
        next(err);
    }
}

export const authorization = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new HTTPError(403, "You do not have permission to do this action"));
        }
        next();
    };
};
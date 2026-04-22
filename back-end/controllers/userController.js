import User from "../models/userModel.js";
import HTTPError from './../utils/HTTPError.js';
import Event from './../models/eventModel.js';
import Registration from './../models/registrationModel.js';
import RefreshToken from "../models/refreshTokenModel.js";
export const getProfile=async(req,res,next)=>{
    try{
    const user = req.user;
    const [organizedEvents, registeredEvents] = await Promise.all([
            Event.find({ organizer: user._id }),
            Registration.find({ user: user._id }).populate("event")
        ]);
    return res.status(200).json({
        status:"Success",
        user,
        organizedEvents,
        registeredEvents
    });
    }catch(err){
        next(err);
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                name: { $regex: search, $options: 'i' } 
            };
        }

        const [users, allUsers] = await Promise.all([
            User.find(query).skip(skip).limit(limit).select('-password').lean(),
            User.countDocuments(query)
        ]);
        
        const pages = Math.ceil(allUsers / limit);
        
        return res.status(200).json({
            status: "Success",
            pagination: {
                allUsers,
                page,
                pages,
            },
            users
        });
    } catch (err) {
        next(err);
    }
};

export const getUserById=async(req,res,next)=>{
    try{
        const userId=req.params.id;
        const user=await User.findById(userId).select('-email');
        if(!user)
            return next(new HTTPError(404,"User not found"));
        const organizedEvents=await Event.find({organizer:user._id});
        return res.status(200).json({
            status:"Success",
            user,
            organizedEvents
        })
    }catch(err){
        next(err);
    }
}

export const updateProfile=async(req,res,next)=>{
    try{
        const{name,email}=req.body;
        const user=req.user;
        user.name=name||user.name;
        user.email=email||user.email;
        await user.save();
        return res.status(200).json({
            status:"Success",
            message:"User updated successfully",
            user
        });
    }catch(err){
        next(err);
    }
}

export const changePassword=async(req,res,next)=>{
    try{
        const {oldPassword,newPassword}=req.body;
        if(!oldPassword || !newPassword){
            return next(new HTTPError(400, "Please provide old and new password"));
        }
        const user=req.user;
        if(!(await user.comparePassword(oldPassword)))
            return next(new HTTPError(400,"Old password incorrect"));
        user.password=newPassword;
        await user.save();
        await RefreshToken.deleteMany({ user: user._id });

        return res.status(200).clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        }).json({
            status:"Success",
            message:"Password updated successfully"
        })
    }catch(err){
        next(err);
    }
}

export const deleteAccount=async(req,res,next)=>{
    try{
        const user=req.user;
        const userEvents = await Event.find({ organizer: user._id }).select('_id');
        const eventIds = userEvents.map(e => e._id);
        await Promise.all([
            User.deleteOne({_id:user._id}),
            Event.deleteMany({organizer:user._id}),
            Registration.deleteMany({user:user._id}),
            Registration.deleteMany({ event: { $in: eventIds } }),
            RefreshToken.deleteMany({ user: user._id })
        ])
        return res.status(200).clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        }).json({
            status:"Success",
            message:"User account deleted successfully"
        })
    }catch(err){
        next(err);
    }
}

export const updateUserRole = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role } = req.body; 

        if (!['user', 'admin'].includes(role)) {
            return next(new HTTPError(400, "Invalid role. Role must be 'user' or 'admin'"));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new HTTPError(404, "User not found"));
        }

        user.role = role;
        await user.save(); 

        return res.status(200).json({
            status: "Success",
            message: "User role updated successfully",
            user
        });
    } catch (err) {
        next(err);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return next(new HTTPError(404, "User not found"));
        }
        const userEvents = await Event.find({ organizer: user._id }).select('_id');
        const eventIds = userEvents.map(e => e._id);

        await Promise.all([
            User.deleteOne({ _id: userId }),
            Event.deleteMany({ organizer: userId }),
            Registration.deleteMany({ user: userId }),
            Registration.deleteMany({ event: { $in: eventIds } }),
            RefreshToken.deleteMany({ user: userId })
        ]);

        return res.status(200).json({
            status: "Success",
            message: "User and all related data deleted successfully by Admin"
        });
    } catch (err) {
        next(err);
    }
}
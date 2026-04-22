import HTTPError from './../utils/HTTPError.js';
import Event from './../models/eventModel.js';
import Category from './../models/categoryModel.js';
import Registration from './../models/registrationModel.js';
import User from "../models/userModel.js";
import QRCode from 'qrcode';
export const registerForEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event)
            return next(new HTTPError(404, "Event not found"));

        if (event.date < new Date())
            return next(new HTTPError(400, "This event has already ended"));

        const existingRegistration = await Registration.findOne({ event: eventId, user: userId });
        if (existingRegistration) {
            return next(new HTTPError(400, "You are already registered for this event"));
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, capacity: { $gt: 0 } }, 
            { $inc: { capacity: -1 } }, 
            { new: true } 
        );
        if (!updatedEvent) {
            return next(new HTTPError(400, "Sorry, this event is fully booked!"));
        }

        const registration = await Registration.create({
            event: eventId,
            user: userId
        });

        const qrData = JSON.stringify({
            registrationId: registration._id,
            eventId: event._id,
            userId: userId
        });

        const qrCodeImage = await QRCode.toDataURL(qrData);
        registration.qrCode = qrCodeImage;
        await registration.save();

        return res.status(201).json({
            status: "Success",
            message: "Successfully registered for the event.",
            ticket: registration
        });

    } catch (err) {
        next(err);
    }
};

export const cancelRegistration = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event)
            return next(new HTTPError(404, "Event not found"));

        if (event.date < new Date())
            return next(new HTTPError(400, "Cannot cancel, event already ended"));

        const existingRegistration = await Registration.findOneAndDelete({
            event: eventId,
            user: userId
        });

        if (!existingRegistration) {
            return next(new HTTPError(400, "You are not registered for this event"));
        }

        await Event.updateOne({ _id: eventId }, { $inc: { capacity: 1 } });

        return res.status(200).json({
            status: "Success",
            message: "Registration cancelled successfully"
        });

    } catch (err) {
        next(err);
    }
};

export const getEventAttendees=async(req,res,next)=>{
    try{
        const eventId=req.params.id;
        const userId=req.user._id;
        const event=await Event.findById(eventId);
        if(!event)
            return next(new HTTPError(404,"Event not found"));
        if(event.organizer.toString() !== userId.toString() && req.user.role!=="admin")
            return next(new HTTPError(403,"You are not authorized to view attendees"));
        const registrations=await Registration.find({ event: eventId}).populate('user','name email');
        return res.status(200).json({
            status:"Success",
            registrations
        })
    }catch(err){
        next(err);
    }
}
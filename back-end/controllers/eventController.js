import HTTPError from './../utils/HTTPError.js';
import Event from './../models/eventModel.js';
import Category from './../models/categoryModel.js';
import Registration from './../models/registrationModel.js';
export const createEvent=async(req,res,next)=>{
    try{
        if (req.file) {
            req.body.image = req.file.path; 
        }
        console.log("Received event data:", req.body);
        const {
            title,
            description,
            date,
            coordinates, // [longitude, latitude]
            address,
            capacity,
            image,
            price,
            category
        } = req.body;   
        const organizer = req.user._id;
        if (new Date(date) < new Date()) {
            return next(new HTTPError(400, "Event date and time must be in the future."));
        }
        let parsedCoordinates = coordinates;
        if (typeof coordinates === 'string') {
            parsedCoordinates = JSON.parse(coordinates);
        }
        const location = {
            type:"Point",
            coordinates: parsedCoordinates,
            address
        }; 
        
        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity,
            image,
            price, 
            category, 
            organizer
        });
        return res.status(201).json({
            status: "Success",
            message: "Event created successfully",
            event
        });
    }catch(err){
        console.error(err);
        next(err);
    }
}

export const getAllEvents = async (req, res, next) => {
    try {
        let { category, search, page = 1, limit = 9, dateFrom, dateTo } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const filter = {};

        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: 'i' };

        // ✅ date filter للـ Calendar
        if (dateFrom) filter.date = { ...filter.date, $gte: new Date(dateFrom) };
        if (dateTo) filter.date = { ...filter.date, $lte: new Date(dateTo) };

        const skip = (page - 1) * limit;

        const [events, totalEvents] = await Promise.all([
            Event.find(filter)
                .sort({ date: 1 })
                .skip(skip)
                .limit(limit)
                .populate('category', 'name')
                .populate('organizer', 'name'),
            Event.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalEvents / limit);

        return res.status(200).json({
            status: "Success",
            pagination: {
                totalEvents,
                totalPages,
                currentPage: page,
                limit: limit
            },
            events
        });
    } catch (err) {
        next(err);
    }
}

export const getTopRegisteredEvents = async (req, res, next) => {
    try {
        const topEvents = await Event.aggregate([
            {
                $match: {
                    date: { $gt: new Date() }
                }
            },
            {
                $lookup: {
                    from: "registrations",
                    localField: "_id",
                    foreignField: "event",
                    as: "registrations"
                }
            },
            {
                $addFields: {
                    registrationCount: { $size: "$registrations" }
                }
            },
            {
                $sort: {
                    registrationCount: -1,
                    date: 1
                }
            },
            {
                $limit: 3
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "organizer",
                    foreignField: "_id",
                    as: "organizer"
                }
            },
            {
                $unwind: {
                    path: "$organizer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    registrations: 0,
                    "organizer.password": 0
                }
            }
        ]);

        return res.status(200).json({
            status: "Success",
            events: topEvents
        });
    } catch (err) {
        next(err);
    }
}

export const getEventById = async (req, res, next) => {
    try {
        const eventId=req.params.id;
        const event=await Event.findById(eventId)
            .populate('category', 'name')
            .populate('organizer', 'name');
        if(!event)
            return next(new HTTPError(404,"Event not found"));

        return res.status(200).json({
            status: "Success",
            event
        });
    } catch (err) {
        next(err);
    }
}

export const updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) {
            return next(new HTTPError(404, "Event not found"));
        }
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new HTTPError(403, "You are not authorized to update this event"));
        }

        const { title, description, date, capacity, price, category, coordinates, address } = req.body;
        
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.capacity = capacity || event.capacity;
        event.category = category || event.category;
        
        if (price !== undefined) {
            event.price = price;
        }

        if (req.file) {
            event.image = req.file.path;
        }

        if (coordinates && address) {
            let parsedCoordinates = coordinates;
            if (typeof coordinates === 'string') {
                parsedCoordinates = JSON.parse(coordinates);
            }
            event.location = {
                type: "Point",
                coordinates: parsedCoordinates,
                address
            };
        }

        await event.save();

        return res.status(200).json({
            status: "Success",
            message: "Event updated successfully",
            event
        });
    } catch (err) {
        next(err);
    }
}

export const deleteEvent=async (req,res,next)=>{
    try{
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) {
            return next(new HTTPError(404, "Event not found"));
        }
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new HTTPError(403, "You are not authorized to delete this event"));
        }
        await Promise.all([
            Event.deleteOne({ _id: eventId }),
            Registration.deleteMany({ event: eventId })
        ]);
        return res.status(200).json({
            status: "Success",
            message: "Event deleted successfully",
            event
        });
    }catch(err){
        next(err);
    }
}
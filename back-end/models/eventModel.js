import { Schema, model } from "mongoose";

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "coordinates are required"],
    },
    address: {
      type: String,
      required: [true, "address is required"],
    },
  },
  { _id: false } 
)

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: [3, "title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "date is required"],
    },
    location: locationSchema,
    capacity: {
      type: Number,
      required: [true, "capacity is required"],
      min: [1, "capacity must be at least 1"],
    },
    price: {
      type: Number,
      default: 0, 
      min: [0, "price cannot be negative"],
    },
    image: {
      type: String,
      default: "https://res.cloudinary.com/dkjtdvvrk/image/upload/v1776864705/default-event-image_wr3gnw.png",
    },    
    category: {
      type: Schema.Types.ObjectId, 
      ref: "Category", 
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "organizer is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Event", eventSchema);
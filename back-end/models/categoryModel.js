import { Schema,model } from "mongoose";

const categorySchema= new Schema({
    name:{
        type:String,
        required:[true,"name is required"],
        unique:true,
        trim:true,
        minlength: [3, "name must be at least 3 characters long"],
        maxlength: [50, "name cannot exceed 50 characters"],
    }
},{
    timestamps:true
});

export default model("Category",categorySchema);
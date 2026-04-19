import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true,"name is required"],
      trim: true,
      minlength: [3, "name must be at least 3 characters long"],
      maxlength: [50, "name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true,"email is required"],
      unique: true, 
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true,"password is required"],
      minlength: [8, "password must be at least 8 characters long"], 
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save",async function(){
  if(!this.isModified("password")) return;
  this.password=await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword=async function(candidatePassword){
  return await bcrypt.compare(candidatePassword,this.password);
}
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v; 
    return ret;
  }
});
export default model("User", userSchema);
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 
    },
  },
  { timestamps: true }
);

refreshTokenSchema.pre("save",async function(){
    if(!this.isModified("token")) return;
    this.token=await bcrypt.hash(this.token,10);
})

refreshTokenSchema.methods.compareToken=async function(reqToken){
    return await bcrypt.compare(reqToken,this.token);
}

export default model("RefreshToken", refreshTokenSchema);
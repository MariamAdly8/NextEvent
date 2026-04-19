import { Schema, model } from "mongoose";

const registrationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "event is required"],
    },
    qrCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default model("Registration", registrationSchema);
import 'dotenv/config';

import app from './app.js';
import mongoose from 'mongoose';

const port=process.env.PORT||4000;
const mongoURI=process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(mongoURI)
.then(()=>{
    console.log("connected to mongoDB");
})
.catch((err)=>{
    console.log("Failed to connect to MongoDB", err);
    process.exit(1);
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
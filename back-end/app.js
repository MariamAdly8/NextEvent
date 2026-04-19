import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';


import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import eventRouter from './routes/eventRoute.js';
import registrationRouter from './routes/registrationRoute.js';

import notFoundMW from './middlewares/notFoundMW.js';
import errorHandlingMW from './middlewares/errorHandlingMW.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use(compression());

app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser()); 
app.use(mongoSanitize());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: "Success",
        message: "Server is healthy and running smoothly!",
        uptime: process.uptime(), 
        timestamp: new Date().toISOString() 
    });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/events', eventRouter);


app.use('/api/registrations', registrationRouter); 

app.use(notFoundMW); 
app.use(errorHandlingMW);

export default app;
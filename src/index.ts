import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI!, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log(`✅ Connected to MongoDB database: ${process.env.DB_NAME}`);


    app.use('/user', userRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

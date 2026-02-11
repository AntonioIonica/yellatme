import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error(
    `Please define the Mongo DB URI in .env.${NODE_ENV}.local file`,
  );
}

// Connect to mongoDB
const connectMongoDB = async () => {
  try {
    // Connecting to mongoDB through mongoose while using the database URI
    await mongoose.connect(DB_URI);

    console.log(`Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.error(
      `An error has occured while connecting to the database. ${error}`,
    );

    process.exit(1);
  }
};

export default connectMongoDB;

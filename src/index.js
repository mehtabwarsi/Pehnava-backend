import { app } from "./app.js";
import connectDB from "./db/mongodb.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
// import model schems
import "./models/index.js";


dotenv.config();

const PORT = process.env.PORT

console.log(`mongoose model name ${mongoose.modelNames()}`)

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(` ⚙️  Server is running at: http://localhost:${PORT}`);
        });

    })
    .catch((err) => console.log("MONGO db connection failed !!!:", err));

// createSuperAdmin();

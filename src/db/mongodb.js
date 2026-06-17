import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dns from "dns";

// Set DNS servers to resolve SRV records properly (bypasses ISP/local router DNS restrictions)
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    console.warn("Failed to set custom DNS servers:", e.message);
}


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        console.log(`\n mongo DB connected !! DB HOST: ${connectionInstance.connection.host}`)
         console.log(
            "DB Name:",
            connectionInstance.connection.db.databaseName
        );
    } catch (error) {
        console.error("MONGODB connection error ", error.message)
        process.exit(1)

    }
}

export default connectDB

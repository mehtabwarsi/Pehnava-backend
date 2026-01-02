import { app } from "./app.js";
import connectDB from "./db/mongodb.js";
import dotenv from "dotenv";
// import createSuperAdmin from "./scripts/createSuperAdmin.js";
dotenv.config();

const PORT = process.env.PORT

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(` ⚙️  Server is running at: http://localhost:${PORT}`);
        });

    })
    .catch((err) => console.log("MONGO db connection failed !!!:", err));

// createSuperAdmin();

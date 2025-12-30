import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// load JSON safely
const serviceAccount = require("./pehnava-161d2-firebase-adminsdk-fbsvc-7a15ffede7.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;

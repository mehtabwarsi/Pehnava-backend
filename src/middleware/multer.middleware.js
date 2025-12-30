import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("📦 Multer received file:", file.fieldname);
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

export const upload = multer({ storage });

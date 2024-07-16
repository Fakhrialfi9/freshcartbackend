import multer from "multer";
import path from "path";

const FILE_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidFormat = FILE_TYPE[file.mimetype];
    let uploadError = new Error("Invalid Format Image");

    if (isValidFormat) {
      uploadError = null;
    }

    cb(uploadError, "public/user/avatarUser");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });

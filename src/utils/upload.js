import multer from 'multer';
import path from 'path'
import { v4 } from 'uuid'

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        const filename = v4() + path.extname(file.originalname)
        req.filename = filename
        cb(null, filename);
    }
});

export default multer({
    storage: storage,
    limits: { fileSize: 1000000 }
});

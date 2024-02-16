import path from 'path'
import fs from 'fs'

export default (img) => {
    try {
        const imageFolder = path.join(process.cwd(), 'uploads');
        const imagePath = path.join(imageFolder, img);
        fs.unlinkSync(imagePath);
    } catch (error) {
        console.log(error)
    }
}
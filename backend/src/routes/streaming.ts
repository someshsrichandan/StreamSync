import express, { Request, Response } from 'express';
import { adminAuth } from '../middlewares/auth';
import multer from 'multer';

const streamingRouter = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
  
  const upload = multer({ storage })

streamingRouter.post('/upload',adminAuth, upload.single('video'), async (req:Request, res:Response):Promise<void> => {

    const { id } = (req as Request & { user: { id: number } }).user;
    console.log(id)
    console.log('Uploaded file:', req.file);
    console.log('Request body:', req.body);

});


export default streamingRouter;
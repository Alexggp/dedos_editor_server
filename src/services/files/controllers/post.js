const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { FilesModel } = require('../../../database/models/projects');

const DIR = './public/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, DIR);
  },
  filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, uuidv4() + '-' + fileName)
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
  }
});


const controller = async (req, res)=>{
  const data = req.body;
  const url = req.protocol + '://' + req.get('host') + '/public/' + req.file.filename;
  try{
    if (await !fs.existsSync(DIR)) {
      await fs.mkdirSync(DIR);
    }
    const file = new FilesModel({
      _id: new mongoose.Types.ObjectId(),
      projectId: data.projectId,
      activityId: data.activityId,
      containerId: data.containerId,
      fileName: req.file.filename
    })
    await file.save();
    const response = {
      url: url
    }
    res.send(response)
  }
  catch (e) {
    console.log(e);
    res.status(500).send();
 }
}

const middleware = [upload.single('file'), controller];
module.exports = middleware;
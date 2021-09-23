
const multer = require('multer');
const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'messages', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
});
exports.uploadMessageImage = async function(req,res){
    let file = req.body.file;
}
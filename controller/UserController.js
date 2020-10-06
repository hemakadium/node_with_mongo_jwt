
//=========================================================================================================================
//                                                                                                                         
//  ##   ##   ####  #####  #####     ####   #####   ##     ##  ######  #####     #####   ##      ##      #####  #####    
//  ##   ##  ##     ##     ##  ##   ##     ##   ##  ####   ##    ##    ##  ##   ##   ##  ##      ##      ##     ##  ##   
//  ##   ##   ###   #####  #####    ##     ##   ##  ##  ## ##    ##    #####    ##   ##  ##      ##      #####  #####    
//  ##   ##     ##  ##     ##  ##   ##     ##   ##  ##    ###    ##    ##  ##   ##   ##  ##      ##      ##     ##  ##   
//   #####   ####   #####  ##   ##   ####   #####   ##     ##    ##    ##   ##   #####   ######  ######  #####  ##   ##  
//                                                                                                                         
//=========================================================================================================================


const express = require('express');
const router = express.Router();
const _ = require('lodash');


//import userAuthenticationModel here
 const checkAuth = require('../middleware/check-auth');
const UserService = require('../service/UserService');
const logger = require('../logger').loggerServices;
//for image upload
const multer = require('multer');

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'D://node//node-with_mongo_sample_project-master//images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + '-' + Date.now()+'.png')
    }
  })
   
  var upload = multer({ storage: storage })

  router.post('/uploadfile', upload.single('userImages'), (req, res, next) => {
    const filename = req.file.originalname + '-' + Date.now()+'.png'
  // console.log("file==",filename)
    if (!filename) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
       
    }else{
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        req.body.image=filename;
      //  res.send(file)
        return UserService.addImage(req, res);  
    }
     
    
  })
//Uploading multiple files
router.post('/uploadmultiple', upload.array('userImages', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
   
      res.send(files)
    
  })




// Retrieve all the users
router.get('/getAllImages', (req, res, next) => {
	return UserService.getAllImages(req, res);
});


// Add a user to data base
router.post('/create', (req, res, next) => {
    if(!_.isUndefined(req.body.firstName) && (!_.isUndefined(req.body.lastName)) && (!_.isUndefined(req.body.email))
    && (!_.isUndefined(req.body.mobile)) && (!_.isUndefined(req.body.password)) ) {
        return UserService.add(req, res);
    } else {
        return res.json({ success: false, msg: 'Restricted condition: Mandatory fields firstName/lastName/email/mobilepassword is missing' })
    }
});

// Retrieve one particular user
router.post('/login', (req, res, next) => {
	if(!_.isUndefined(req.body.email)&& !_.isUndefined(req.body.password) ) {
        return UserService.login(req, res);
    } else {
        return res.json({ success: false, msg: 'Restricted condition: Mandatory fields email/password is missing' })
    }
});

// Retrieve one particular user
router.get('/getone',checkAuth, (req, res, next) => {
    const id=global.dbuserId;
    req.body._id=id;
        return UserService.getUser(req, res);
    
});

// Retrieve all the users
router.get('/getall',checkAuth, (req, res, next) => {
	return UserService.getAllUsers(req, res);
});

/**
 * Update one user's info, excluding
 * email, where it is unqiue identifier &
 * password, make an API for password updation, which avoids choas
 */
router.post('/update',checkAuth, (req, res, next) => {
    const id=global.dbuserId;
    req.body._id=id;
    if(!_.isUndefined(req.body._id) ) {
        delete req.body.updateFields.password;
        return UserService.update(req, res);
    } else {
        return res.json({ success: false, msg: 'Restricted condition: Mandatory fields firstName/lastName/email/mobilepassword is missing' })
    }
});

/**
 * Best practice of deletion is,
 * Soft delete, by maintaining a flag named isDeleted in auditFields
 */
router.get('/delete',checkAuth, (req, res, next) => {
    const id=global.dbuserId;
    req.body._id=id;
	if(!_.isUndefined(req.body._id) ) {
        return UserService.delete(req, res);
    } else {
        return res.json({ success: false, msg: 'Restricted condition: Mandatory field token is missing' })
    }
});


module.exports = router;
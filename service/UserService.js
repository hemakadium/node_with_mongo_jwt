//======================================================================================
//                                                                                      
//  ##   ##   ####  #####  #####     ####  #####  #####    ##   ##  ##   ####  #####  
//  ##   ##  ##     ##     ##  ##   ##     ##     ##  ##   ##   ##  ##  ##     ##     
//  ##   ##   ###   #####  #####     ###   #####  #####    ##   ##  ##  ##     #####  
//  ##   ##     ##  ##     ##  ##      ##  ##     ##  ##    ## ##   ##  ##     ##     
//   #####   ####   #####  ##   ##  ####   #####  ##   ##    ###    ##   ####  #####  
//                                                                                      
//======================================================================================


const UserModel = require('../model/UserModel');
const UserImageModel = require('../model/UserImageModel');
const _ = require('lodash');
const Constants = require('../config/Constants')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { compareSync } = require('bcryptjs');
const logger = require('../logger').loggerServices;

module.exports.addImage = function (req, res) {
     
    UserImageModel.addUserImages(req, (err, user) => {
                if (err) {
                    logger.error(['create : error while adding the records :', err]);
                    res.json({
                        success: Constants.BOOLEAN.FALSE,
                        msg: 'Failed to add image',
                        data: err.toString()
                    });
                } else {
                    logger.info(['create : result after saving user record : ', user])
                    //Following best practice to exclude passwords in the response.
                    delete user._doc.password;
                    res.json({
                        success: Constants.BOOLEAN.TRUE,
                        msg: 'Image added successfully',
                        data: user
                    });
                }
            });
        }

module.exports.add = function (req, res) {
    UserModel.getOne({ email: { $eq: req.body.email } }, (err, result) => {
        if (err) {
            logger.error(['create : Failed to register user :', err]);
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to register user',
                data: err.toString()
            });
        } else if (result) {
            logger.error(['create : User already exists. Please try to login :', err]);
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'User already exists. Please try to login'
            });
        } else {
            UserModel.addUser(prepareUser(req), (err, user) => {
                if (err) {
                    logger.error(['create : error while adding the records :', err]);
                    res.json({
                        success: Constants.BOOLEAN.FALSE,
                        msg: 'Failed to register user',
                        data: err.toString()
                    });
                } else {
                    logger.info(['create : result after saving user record : ', user])
                    //Following best practice to exclude passwords in the response.
                    delete user._doc.password;
                    res.json({
                        success: Constants.BOOLEAN.TRUE,
                        msg: 'User registered',
                        data: user
                    });
                }
            });
        }
    });
}


module.exports.login = function (req, res) {
    var conditions = {
        "email": req.body.email
    }
    UserModel.getOne(conditions, (err, user) => {
         if (user===null) {
            logger.error(['create : Failed to get user : ', err])
                res.json({
                    success: Constants.BOOLEAN.FALSE,
                    msg: 'Failed to get user',
                   // data: err
                });
              }else{

            
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    logger.error(['create : Auth failed : ', err])
                  return res.status(401).json({
                    message: "Auth failed"
      
                  });
                }
                if (result) {
                  const token = jwt.sign(
                    {
                     // email: user[0].email,
                      userId: user._id
                    },
                    process.env.JWT_KEY='secret',
                    {
                      expiresIn: "1h"
                    }
                  );

                  logger.info(['create : Auth successful : ', user])
                  return res.status(200).json({
      
                    message:'Auth successful',
                    data:{
                        auditFields:user.auditFields,
                        _id:user._id,
                        firstName:user.firstName,
                          lastName:user.lastName,
                          email:user.email,
                          phoneNumber:user.phoneNumber,
                         token: token
                      }
                  });
                }
                res.status(401).json({
                  message: "Auth failed,Password is wrong"
                });
              });
            }
    });
}

module.exports.getUser = function (req, res) {
    var conditions = {
        _id:req.body._id,
        'auditFields.isDeleted': false
    }
    UserModel.getOneuser(conditions, (err, user) => {
        if (err) {
            logger.error(['getUser : Failed to get user : ', err])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to get user',
                data: err.toString()
            });
        } else {
            /**
             *  Following best practice to exclude passwords in the response,
             *  which is handled at schema defination.
             * */
        //   console.log(user)
            if(user!=null){
                logger.info(['getUser : get All users from database : ', user])
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: user
                });
            }else{
                logger.info(['getUser :No data found : ', user])
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: "No data found"
                });
            }
           
        }
    });
}


module.exports.getAllImages = function (req, res) {
    //Instead of getting all the users, Pagination can be done here.
   
     
    UserImageModel.getAll((err, users) => {
        console.log(users)
        if (err) {
          //  logger.error(['getAllUsers : Failed to get users : ', err])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to get user',
                data: err
            });
        } else if (users) {
           // logger.info(['getAllUsers : Get All users from database : ', users])
           if(users.length>1){
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: users
                });
            }else{
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: "No data found"
                });
            }
           
        } else {
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'No data found'
            });
        }
    });
}

module.exports.getAllUsers = function (req, res) {
    //Instead of getting all the users, Pagination can be done here.
     
    UserModel.getAll((err, users) => {
        
        if (err) {
            logger.error(['getAllUsers : Failed to get users : ', err])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to get user',
                data: err.toString()
            });
        } else if (users) {
            logger.info(['getAllUsers : Get All users from database : ', users])
           if(users.length>1){
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: users
                });
            }else{
                res.json({
                    success: Constants.BOOLEAN.TRUE,
                    data: "No data found"
                });
            }
           
        } else {
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'No data found'
            });
        }
    });
}

module.exports.update = function (req, res) {
   
    var conditions = {
        _id: req.body._id
    }
    UserModel.updateUser(conditions, req.body.updateFields, (err, isUpdated) => {
        if (err) {
            logger.error(['update : Failed to get user : ', err])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to get user',
                data: err.toString()
            });
        } else if (isUpdated) {
            logger.info(['update : updated user : ', isUpdated])
            res.json({
                success: Constants.BOOLEAN.TRUE,
                data: isUpdated
            });
        }
    });
}

module.exports.delete = function (req, res) {
    var condition = {
        _id: req.body._id,
        'auditFields.isDeleted': Constants.BOOLEAN.FALSE
    }
    UserModel.getOne(condition, (err, user) => {
        if (err) {
            logger.error(['delete : Failed to get user : ',err])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'Failed to get user',
                data: err.toString()
            });
        } else if (user) {
            var updateFields = {};
            updateFields['auditFields.isDeleted'] = Constants.BOOLEAN.TRUE;
            UserModel.updateUser(condition, updateFields, (err, isUpdated) => {
                if (err) {
                    logger.error(['delete : Failed to delete user : ', err])
                    res.json({
                        success: Constants.BOOLEAN.FALSE,
                        msg: 'Failed to delete user',
                        data: err.toString()
                    });
                } else if (isUpdated) {
                    logger.info(['delete : Successfully soft deleted user : ', isUpdated])
                    res.json({
                        success: Constants.BOOLEAN.TRUE,
                        msg: 'Successfully soft deleted user.',
                    });
                }
            });
        } else {
            logger.error(['delete : No user foud with this token : '])
            res.json({
                success: Constants.BOOLEAN.FALSE,
                msg: 'No user foud with this token'
            });
        }
    });
}


var prepareUser = function (req) {
    //auditFields are assigned with default values as setted in UserModel
    var newUser = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password
    });
    return newUser;
};


var prepareImageUser = function (req) {
    //auditFields are assigned with default values as setted in UserModel
    var newUseImage = new UserImageModel({
        userId: req.body.userId,
        iamge: req.body.image
    });
    return prepareImageUser;
};
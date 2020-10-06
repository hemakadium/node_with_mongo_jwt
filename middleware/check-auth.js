const jwt = require('jsonwebtoken');
const User = require("../model/UserModel");
const logger = require('../logger').loggerServices;
global.dbuserId = "";
 
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        //console.log(token)
        //const decoded = jwt.verify(token, process.env.JWT_KEY);
        const decoded = jwt.verify(token, 'secret');
        req.userData = decoded;
        const userid=decoded.userId;
        logger.info("decoded user id",userid)
//console.log(userid)
        User.findOne({ _id: userid }) //checks for email existance
        .exec()
        .then(user => {
            dbuserId=user._id;
          if (user.length < 1) {
            logger.error("invalid id")
            return res.status(400).json({
              
                message: 'Invalid token' // usre id is not there
            });
          } else {
            next();
          }

      
    })
    } catch (error) {
      logger.error("not found")
        return res.status(400).json({
            message: 'Invalid token'
        });
    }
};

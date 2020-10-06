//================================================================================
//                                                                                
//  ##   ##   ####  #####  #####    ###    ###   #####   ####    #####  ##      
//  ##   ##  ##     ##     ##  ##   ## #  # ##  ##   ##  ##  ##  ##     ##      
//  ##   ##   ###   #####  #####    ##  ##  ##  ##   ##  ##  ##  #####  ##      
//  ##   ##     ##  ##     ##  ##   ##      ##  ##   ##  ##  ##  ##     ##      
//   #####   ####   #####  ##   ##  ##      ##   #####   ####    #####  ######  
//                                                                                
//================================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ObjectId = mongoose.Schema.Types.ObjectId;
 const Constants = require('../config/Constants');
 const AppConfig = require('../config/AppConfig');
var _ = require('lodash');
const logger = require('../logger').loggerServices;
 const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        index: true,
        unique: true,
        required: true,
        lowercase: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
     //   select: false
    },
    auditFields: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }

});

const User = module.exports = mongoose.model('UserModel', UserSchema);


module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) 
            logger.error(err)
            throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}
module.exports.getOne = function (condition, callback) {
     condition['auditFields.isDeleted'] = false;
     User.findOne(condition,callback) ;
     
          
 }
module.exports.getOneuser = function (condition, callback) {
   // condition['auditFields.isDeleted'] = false;
    //User.findOne(condition,callback) ;
    var MongoClient = require('mongodb').MongoClient;
    var url = AppConfig.database.url; 
    MongoClient.connect(url,callback, function(err, db) {
        if (err) throw err;
        var dbo = db.db("nodeapp");
        dbo.collection('usermodels').aggregate([
          { $lookup:
             {
               from: 'userimagemodels',
               localField: '_id',
               foreignField: 'userId',
               as: 'userinfo'
             }
           }
           
          ]).toArray(function(err, res) {
          if (err) {
              throw err;
          }else{
            callback(err,res);
          }
        
          //const img=JSON.stringify(res);
          //console.log(img);
          db.close();
        });
      });
         
}

module.exports.getAll = function (callback) {
    var condition = {
        'auditFields.isDeleted': false
    }
    // Sorting with latest updated as first
    User.find(condition,callback).sort('-auditFields.updatedAt');

   
}
module.exports.updateUser = function (conditions, updateFields, callback) {
    _.isUndefined(updateFields.auditFields)? updateFields['auditFields.updatedAt'] = new Date() : null
    User.updateOne(conditions, {
        $set: updateFields,
    }, function (err, out) {
        if (err) {
            logger.error(err)
            callback(err, null)
        } else if (out.nModified <= 0) {
            logger.error('Data not updated',err)
            callback("Data not updated", null);
        }
        else {
            callback(null, out)
        }
    });
}

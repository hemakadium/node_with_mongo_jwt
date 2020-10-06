
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ObjectId = mongoose.Schema.Types.ObjectId;
// const Constants = require('../config/Constants');
const AppConfig = require('../config/AppConfig');
var _ = require('lodash');
const logger = require('../logger').loggerServices;


const UserImageSchema = mongoose.Schema({
    userId:  {type: mongoose.Types.ObjectId,ref: 'UserModel',require:true},
    image: {
        type: String,
        required: true,
        trim: true
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

const UserImage = module.exports = mongoose.model('UserImageModel', UserImageSchema);



module.exports.addUserImages = function (req, callback) {
    console.log()
    console.log(req.body.userId)
    const userImage = new UserImage({
      
        image:req.body.image,
        userId:req.body.userId 
      });
      userImage.save(callback);
}
module.exports.getAll = function (callback) {
//     var condition = {
//         'auditFields.isDeleted': false
//     }
//     // Sorting with latest updated as first
//    UserImage.find(condition,callback) ;
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
               as: 'userImages'
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

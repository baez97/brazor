var url      = "mongodb://baez97:myPassword1234@ds247061.mlab.com:47061/brazor";
var races    = require('./racesCodeData.js');
var mongo    = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

function Dao() {
    
    this.users = undefined;

    // --------------------------------------------------------------------
    // --------------------------- CONNECTION -----------------------------
    // --------------------------------------------------------------------
    this.connect=function(callback){
        var dao=this;
        mongo.connect(url, { useNewUrlParser: true }, function( err, db ) {
            if ( err ) {
                console.log("No pudo conectar a la base de datos")
            } else {
                const myDb = db.db("brazor");
                myDb.collection("users", function(err,col) {
                    if ( err ) {
                        console.log("No se pudo obtener la colección de usuarios");
                    } else {       
                        dao.users = col;   
                    }
                });
                return callback(myDb);
            }
        });
    }

    // --------------------------------------------------------------------
    // ----------------------------- READ ---------------------------------
    // --------------------------------------------------------------------
    this.findUser = function ( filter, callback ) {
        this.findDocument(this.users, filter, callback);
    }

    this.findDocument = function ( collection, filter, callback ) {
        collection.find(filter).toArray(function(error, result) {
            if ( error || result.length == 0 ) {
                callback(undefined);
            } else {
                callback(result[0]);
            }
        })
    }

    // --------------------------------------------------------------------
    // ---------------------------- CREATE --------------------------------
    // --------------------------------------------------------------------
    this.insertUser = function ( user, callback ) {
        this.insert(this.users, user, callback);
    }

    this.insert = function ( collection, element, callback ) {
        collection.insertOne(element, function(err, result) {
            if ( err ) {
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }

    // --------------------------------------------------------------------
    // ----------------------------- EDIT ---------------------------------
    // --------------------------------------------------------------------
    this.editUser = function(user, callback) {
        this.edit(this.users, user, callback);
    }

    this.loginUser = function ( filter, callback ) {
        this.users.findOneAndUpdate(filter, {$set: {online: true}}, {returnOriginal: true}, function( err, result ) {
            if ( err || result.length == 0 ) {
                callback(undefined);
            } else {
                callback(result.value);
            }
        })
    }

    this.logoutUser = function ( filter, callback ) {
        this.users.findOneAndUpdate(filter, {$set: {online: false}}, function( err, result ) {
            if ( err || result.length == 0 ) {
                callback(undefined);
            } else {
                callback(result.value);
            }
        })
    }

    this.addFriend = function(user, email, callback) {
        this.users.findOneAndUpdate({_id: ObjectId(user._id)}, {$push: {friends: email}}, function( err, result ) {
            if ( err ) {
                console.log(err);
                callback(undefined);
            } else {
                callback(result);
            }
        })
    }

    this.addFighter = function(player, fighterName, callback) {
        var fighter = races.races[fighterName];

        var newFighter = {
            name: fighterName,
            damage: fighter.damage,
            life: fighter.life,
            reach: fighter.reach
        }

        this.users.findOneAndUpdate({email: player.email}, 
            { $push: {fighters: newFighter}}, function( err, result ) {
            if ( err ) {
                console.log(err);
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }

    this.earnExperience = function(player, callback) {
        this.users.findOneAndUpdate({email: player.email},
            {$inc: {experience: 10, diplomas: 1}}, function( err, result ) {
            if ( err ) {
                console.log(err);
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }

    this.edit = function(collection, data, callback) {
        collection.findOneAndReplace({ _id: ObjectId(data._id)}, data, {}, function( err, result ) {
            if ( err ) {
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }

    // --------------------------------------------------------------------
    // ---------------------------- DELETE --------------------------------
    // --------------------------------------------------------------------
    this.deleteUser = function (uid, callback) {
        delete(this.users, { _id: ObjectId(uid) }, callback);
    }

    this.delete = function(collection, filter, callback) {
        collection.remove(filter, function (err, result) {
            if ( err ) {
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }
 
}

module.exports.Dao = Dao;

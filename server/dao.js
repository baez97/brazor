var url      = "mongodb://baez97:myPassword1234@ds247061.mlab.com:47061/brazor"
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
        insert(this.users, usu, callback);
    }

    this.insert = function ( collection, element, callback ) {
        colection.insertOne(element, function(err, result) {
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

    this.edit = function(colection, data, callback) {
        colection.findAndModify({ _id: ObjectId(data._id)}, {}, data, {}, function( err, result ) {
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

    this.delete = function(colection, filter, callback) {
        colection.remove(filter, function (err, result) {
            if ( err ) {
                callback(undefined);
            } else {
                callback(result);
            }
        });
    }
 
}

module.exports.Dao = Dao;

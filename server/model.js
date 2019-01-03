var cf = require("./encryption.js");
var dao = require("./dao.js");

class Juego {
    constructor() {
        this.dao = new dao.Dao();
        this.dao.connect( function(db) {
            console.log("conectado a la base de datos");
        })
    }

    loginUser(email, password, callback) {
        var cryptedPassword = cf.encrypt(password);

        let filter = { email: email, password: cryptedPassword }
        this.dao.findUser(filter, function(user) {
            callback(user);
        });
    }

    registerUser(user, callback) {
        var cryptedPassword = cf.encrypt(user.password);

        user.password = cryptedPassword;

        this.dao.insertUser(user, function(result) {
            callback(result);
        })
    }
}

module.exports.Juego = Juego;
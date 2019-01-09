var cf = require("./encryption.js");
var dao = require("./dao.js");

class Juego {
    constructor() {
        this.dao = new dao.Dao();
        this.fightPlaces = [];
        this.dao.connect( function(db) {
            console.log("conectado a la base de datos");
        })
    }

    getUser(email, callback) {
        var self  = this;
        let filter = { email: email };
        self.dao.findUser(filter, function(user) {
            callback(user);
        });
    }

    loginUser(email, password, callback) {
        var self = this;
        var cryptedPassword = cf.encrypt(password);

        let filter = { email: email, password: cryptedPassword }
        self.dao.loginUser(filter, function(user) {
            if ( user == null ) {
                self.dao.findUser(filter, callback);
            } else {
                callback(user);
            }
        });
    }

    logoutUser(email, callback) {
        this.dao.logoutUser({email: email}, function(user) {
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

    addFriendByEmail(user, email, callback) {
        var self = this;
        this.dao.findUser({email: email}, function(newFriend) {
            if ( newFriend ) {
                self.addFriends(user, newFriend, callback)
            } else {
                callback(undefined);
            }
        })
    }

    addFriends(user1, user2, callback) {
        var self = this;

        self.dao.addFriend(user1, user2.email, function(result) {
            if ( result ) {
                self.dao.addFriend(user2, user1.email, callback);
            } else {
                callback(result);
            }
        })
    }

    getFriends(data, callback) {
        var collection = [];
        var promises = [];
        var friend;
        var self = this;

        data.friends.forEach( (email) => {
            promises.push( new Promise ((resolve, reject) => {
                self.dao.findUser({email: email}, function(result) {
                    if ( result ) {
                        friend = {
                            email: email,
                            name: result.name,
                            diplomas: result.diplomas,
                            online: result.online
                        }
                        collection.push(friend);
                        resolve();
                    } else {
                        reject();
                    }
                })
            }));
        })

        Promise.all(promises)
            .then( () => {
                callback(collection);
            })
            .catch( (err) => {
                console.log(err);
                callback(undefined);
            });
    }

    createFightPlace(user1, user2, callback) {
        var newPlaceID = "place-" + this.fightPlaces.length;

        var player1 = new Player(user1);
        var player2 = new Player(user2);

        var newPlace = new FightPlace(player1, player2, newPlaceID);
        this.fightPlaces.push(newPlace);
        callback(newPlaceID);
    }

    simulateFightPlace(user1, user2, id) {
        if ( ! this.fightPlaces.length ) {
            var player1 = new Player(user1);
            var player2 = new Player(user2);

            var newPlace = new FightPlace(player1, player2, id);
            this.fightPlaces.push(newPlace);
        }
    }

    getFightPlace(fighPlaceID) {
        return this.fightPlaces.find((place) => { return place.id === fighPlaceID });
    }
    
    moveFighter(playerName, fighterName, movement, fightPlaceID) {
        var fightPlace = this.getFightPlace(fightPlaceID);
        var player = fightPlace.getPlayer(playerName);
        var fighter = player.getFighter(fighterName);

        if ( movement.x >= 0 && movement.x <= 13 ) {
            if ( movement.y >= 0 && movement.y <= 9 ) {
                fighter.x = movement.x;
                fighter.y = movement.y;
            }
        }
    }

    attackFighter(playerName, fighterName, objectivePos, fightPlaceID) {
        var fightPlace = this.getFightPlace(fightPlaceID);

        var player = fightPlace.getPlayer(playerName);
        var fighter = player.getFighter(fighterName);

        var enemy = fightPlace.getEnemy(playerName);
        var objectiveFighter = enemy.getFighterAtPos(objectivePos);

        if ( objectiveFighter ) {
            objectiveFighter.life -= fighter.damage;
        }
    }
}

class FightPlace {
    constructor(player1, player2, id) {
        this.player1 = player1;
        this.player2 = player2;
        this.id = id;
        this.initFighters();
    }

    initFighters() {
        var i = 3;
        this.player1.fighters.forEach( (fighter) => {
            fighter.x = i;
            fighter.y = 0;
            fighter = new Fighter(fighter);
            i--;
        });
        i = 10;
        this.player2.fighters.forEach( (fighter) => {
            fighter.x = i;
            fighter.y = 9;
            fighter = new Fighter(fighter);
            i++;
        });
    }

    getPlayer(name) {
        if ( this.player1.name === name ) {
            return this.player1;
        } else if ( this.player2.name === name) {
            return this.player2;
        }
        return undefined;
    }

    getEnemy(name) {
        if ( this.player1.name != name ) {
            return this.player1;
        } else {
            return this.player2;
        }
    }
}

class Player {
    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.fighters = JSON.parse(JSON.stringify(user.fighters));
    }

    getFighter(name) {
        return this.fighters.find( (fighter) => { 
            return fighter.name === name;
        });
    }

    getFighterAtPos(position) {
        return this.fighters.find( (fighter) => {
            return fighter.x === position.x && 
                   fighter.y === position.y;
        })
    }
}

class Fighter {
    constructor(fighter) {
        var {name, damage, life, x, y} = fighter;
        this.name = name;
        this.damage = damage;
        this.life = life;
        this.x = x;
        this.y = y;
        this.reach = fighter.reach;
    }
}

module.exports.Juego = Juego;
module.exports.FightPlace = FightPlace;
module.exports.Player = Player;
module.exports.Fighter = Fighter;
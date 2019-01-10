var cf = require("./encryption.js");
var dao = require("./dao.js");

class Juego {
    constructor() {
        this.dao = new dao.Dao();
        this.fightPlaces = [];
        this.dao.connect( function(db) {
            console.log("conectado a la base de datos");
        });
        this.races = [
            'yopuka', 'feca', 'ocra', 'aniripsa',
            'timador', 'osamodas', 'sadida', 'sacrogito'
        ];
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
                callback({error: true});
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
        fightPlace.moveFighter(playerName, fighterName, movement);
    }

    attackFighter(playerName, fighterName, objectivePos, fightPlaceID) {
        var fightPlace = this.getFightPlace(fightPlaceID);
        var change = fightPlace.attackFighter(playerName, fighterName, objectivePos);

        change.end = this.isTheEnd(fightPlaceID); 

        return change;
    }

    spendTurn(playerName, fightPlaceID) {
        var fightPlace = this.getFightPlace(fightPlaceID);
        fightPlace.spendTurn(playerName);
    }

    isTheEnd(fightPlaceID) {
        var self = this;
        var fightPlace = this.getFightPlace(fightPlaceID);
        var deadPlayerName = fightPlace.isTheEnd();

        if (deadPlayerName) {
            var winner = fightPlace.getEnemy(deadPlayerName);
            this.unlockFighter(winner, function() {
                self.dao.earnExperience(winner, function() {
                    return deadPlayerName;
                })
            });
        }

        return deadPlayerName;
    }

    unlockFighter(user, callback) {
        if ( user.fighters.length >= 4 ) {
            callback();
        } else {
            var newFighter = user.fighters[0].name;
            while ( this.userHasFighter( user, newFighter ) ) {
                newFighter = this.getRandomFighter();
            }
            this.dao.addFighter(user, newFighter, function() {
                callback();
            });
        }
    }

    getRandomFighter() {
        let randomIndex = Math.floor(Math.random()*this.races.length);
        return this.races[randomIndex];
    }

    userHasFighter(user, fighterName) {
        var found = user.fighters.find((fighter) => {
            return fighter.name == fighterName;
        });
        if ( found == undefined ) {
            return false;
        } else {
            return found;
        }
    }
}

class FightPlace {
    constructor(player1, player2, id) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1.isYourTurn();
        this.id = id;
        this.initFighters();
    }

    initFighters() {
        var i = 3;
        var newFighters1 = [];
        var newFighters2 = [];
        this.player1.fighters.forEach( (fighter) => {
            fighter.x = i;
            fighter.y = 0;
            fighter.movementPoints = 6;
            newFighters1.push(new Fighter(fighter, this.player1.killFighter));
            i--;
        });
        this.player1.fighters = newFighters1;

        i = 10;
        newFighters2 = [];
        this.player2.fighters.forEach( (fighter) => {
            fighter.x = i;
            fighter.y = 9;
            fighter.player = this.player2;
            fighter.movementPoints = 6;
            newFighters2.push(new Fighter(fighter, this.player2.killFighter));            
            i++;
        });
        this.player2.fighters = newFighters2;
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

    moveFighter(playerName, fighterName, movement) {
        var player = this.getPlayer(playerName);
        player.moveFighter(fighterName, movement);
    }

    attackFighter(playerName, fighterName, objectivePos) {
        var player = this.getPlayer(playerName);
        var enemy = this.getEnemy(playerName);

        return player.attackFighter(fighterName, enemy, objectivePos);
    }

    spendTurn(playerName) {
        var player = this.getPlayer(playerName);
        var enemy  = this.getEnemy(playerName);
        if ( player.turn ) {
            player.isNotYourTurn();
            enemy.isYourTurn();
        }
    }

    isTheEnd() {
        if ( this.player1.isDead() ) {
            return this.player1.name;
        } else if ( this.player2.isDead() ) {
            return this.player2.name;
        }
        return undefined;
    }
}

class Player {

    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.fighters = JSON.parse(JSON.stringify(user.fighters));
        this.turn = false;
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

    moveFighter(fighterName, movement) {
        var fighter = this.getFighter(fighterName);
        fighter.move(movement);
    }

    attackFighter(fighterName, enemy, objectivePos) {
        var fighter = this.getFighter(fighterName);
        return fighter.attack(enemy, objectivePos);
    }

    getAttackedFighter(objectivePos, damage) {
        var self = this;
        var fighter = this.getFighterAtPos(objectivePos);
        fighter.getAttacked(damage);
    }

    isDead() {
        var aliveFighters = this.fighters.find( (fighter) => {
            return fighter.dead === false;
        });

        return aliveFighters == undefined;
    }

    isYourTurn() {
        this.turn = true;
    }

    isNotYourTurn() {
        this.turn = false;
        this.resetFighters();
    }

    resetFighters() {
        this.fighters.forEach( (fighter) => {
            fighter.resetPoints();
        })
    }
}

class Fighter {
    constructor(fighter, killFunction) {
        var {name, damage, life, x, y} = fighter;
        this.name = name;
        this.damage = damage;
        this.life = life;
        this.x = x;
        this.y = y;
        this.reach = fighter.reach;
        this.killFunction = killFunction;
        this.movementPoints = fighter.movementPoints;
        this.hasAttacked = false;
        this.dead = false;
    }

    move(movement) {
        var distX, distY;
        if ( movement.x >= 0 && movement.x <= 13 )
        if ( movement.y >= 0 && movement.y <= 9  ) {
            distX = Math.abs(movement.x-this.x);
            distY = Math.abs(movement.y-this.y);
            if ( distX + distY < this.movementPoints ) {
                this.x = movement.x;
                this.y = movement.y;
                this.movementPoints -= ( distX + distY );
            }
        }
    }

    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    this.hasAttacked = true;
                    enemy.getAttackedFighter(objectivePos, this.damage);
                    return { position: objectivePos, damage: (this.damage*(-1)) };
                } 
            }
        }
    }

    getAttacked(damage) {
        this.life -= damage;
        if ( this.life <= 0 ) {
            this.dead = true;
        }
    }

    resetPoints() {
        this.movementPoints = 4;
        this.hasAttacked = false;
    }
}

module.exports.Juego = Juego;
module.exports.FightPlace = FightPlace;
module.exports.Player = Player;
module.exports.Fighter = Fighter;
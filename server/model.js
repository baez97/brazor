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

    addFriendByName(user, name, callback) {
        var self = this;
        this.dao.findUser({name: name}, function(newFriend) {
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
    
    attackOwnFighter(playerName, fighterName, objectivePos, fightPlaceID) {
        var fightPlace = this.getFightPlace(fightPlaceID);
        var change = fightPlace.attackOwnFighter(playerName, fighterName, objectivePos);

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
            winner.removeInvocations(); // Invocations can make the user not to unlock next 
                                        // fighter because he already has 4 fighters (invocations
                                        // count as fighter)
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
        this.parlor = new Parlor();
        this.initFighters();
    }

    initFighters() {
        var self = this;
        var i = 3;
        var newFighters1 = [];
        var newFighters2 = [];
        this.player1.fighters.forEach( (fighter) => {
            fighter.x = i;
            fighter.y = 0;
            fighter.movementPoints = 6;
            if ( fighter.name == "aniripsa" ) {
                newFighters1.push(self.parlor["aniripsa"](fighter));
            } else if (fighter.name == "sacrogito") {
                newFighters1.push(self.parlor["sacrogito"](fighter));
            } else if (fighter.name == "feca") {
                newFighters1.push(self.parlor["feca"](fighter));
            } else if (fighter.name == "osamodas") {
                newFighters1.push(self.parlor["osamodas"](fighter));
            } else if (fighter.name == "timador") {
                newFighters1.push(self.parlor["timador"](fighter));
            } else if (fighter.name == "sadida") {
                newFighters1.push(self.parlor["sadida"](fighter));
            } else {
                newFighters1.push(new Fighter(fighter));
            }
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
            if ( fighter.name == "aniripsa" ) {
                newFighters2.push(self.parlor["aniripsa"](fighter));
            } else if (fighter.name == "sacrogito") {
                newFighters2.push(self.parlor["sacrogito"](fighter));
            } else if (fighter.name == "feca") {
                newFighters2.push(self.parlor["feca"](fighter));
            } else if (fighter.name == "osamodas") {
                newFighters2.push(self.parlor["osamodas"](fighter));
            } else if (fighter.name == "timador") {
                newFighters2.push(self.parlor["timador"](fighter));
            } else if (fighter.name == "sadida") {
                newFighters2.push(self.parlor["sadida"](fighter));
            } else {
                newFighters2.push(new Fighter(fighter));
            }          
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

        var change = player.attackFighter(fighterName, enemy, objectivePos);
        if ( change.invocation != undefined ) {
            player.addInvocation(this.parlor[change.invocation.creature](change.invocation.position));
        }
        return change;
    }

    attackOwnFighter(playerName, fighterName, objectivePos) {
        var player = this.getPlayer(playerName);

        return player.attackOwnFighter(fighterName, player, objectivePos);
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
            return fighter.x == position.x && 
                   fighter.y == position.y;
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
    
    attackOwnFighter(fighterName, myself, objectivePos) {
        var fighter = this.getFighter(fighterName);
        return fighter.attackOwn(myself, objectivePos);
    }

    getAttackedFighter(objectivePos, damage) {
        var fighter = this.getFighterAtPos(objectivePos);
        if ( fighter != undefined ) {
            fighter.getAttacked(damage);
            return { position: objectivePos, damage: (damage*(-1)) };
        } else {
            return {};
        }
    }

    addPMFighter(objectivePos, damagePM) {
        var fighter = this.getFighterAtPos(objectivePos);
        if ( fighter != undefined ) {
            fighter.addPM(damagePM);
            return { pm: { position: objectivePos, damagePM: damagePM } };
        } else {
            return {};
        }
    }

    removePMFighter(objectivePos, damagePM) {
        var fighter = this.getFighterAtPos(objectivePos);
        if ( fighter != undefined ) {
            fighter.removePM(damagePM);
            return { pm: { position: objectivePos, damagePM: (damagePM*(-1)) } };
        } else {
            return {};
        }
    }

    isDead() {
        var aliveFighters = this.fighters.find( (fighter) => {
            return fighter.dead == false;
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

    addInvocation(invocation) {
        this.fighters.push(invocation);
    }

    removeInvocations() {
        this.fighters = this.fighters.filter( (fighter) => {
            return !fighter.isInvocation();
        });
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
                    var change = enemy.getAttackedFighter(objectivePos, this.damage);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                    }
                    return change;
                    // return { position: objectivePos, damage: (this.damage*(-1)) };
                } 
            }
        }
        return {};
    }

    attackOwn(player, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    this.hasAttacked = true;
                    player.getAttackedFighter(objectivePos, this.damage);
                    return { position: objectivePos, damage: (this.damage*(-1)) };
                } 
            }
        }
        return {};
    }

    getAttacked(damage) {
        this.life -= damage;
        if ( this.life <= 0 ) {
            this.dead = true;
        }
    }

    addPM(damagePM) {
        this.movementPoints += damagePM;
    }

    removePM(damagePM) {
        this.movementPoints -= damagePM;
    }

    resetPoints() {
        this.movementPoints = 4;
        this.hasAttacked = false;
    }

    isInvocation() {
        return false;
    }
}

class Parlor {
    aniripsa(fighter) {
        return new Aniripsa(fighter);
    }
    // yopuka() {
    //     return new Yopuka();
    // }
    // ocra() {
    //     return new Ocra();
    // }
    timador(fighter) {
        return new Timador(fighter);
    }
    sadida(fighter) {
        return new Sadida(fighter);
    }
    osamodas(fighter) {
        return new Invocator(fighter);
    }
    sacrogito(fighter) {
        return new Sacrogito(fighter);
    }
    feca(fighter) {
        return new Feca(fighter);
    }
    oso(position) {
        return new Oso(position);
    }
    tofu(position) {
        return new Tofu(position);
    }
    jalato(position) {
        return new Jalato(position);
    }
    bomb1(position) {
        return new Bomb1(position);
    }
    bomb2(position) {
        return new Bomb2(position);
    }
    bomb3(position) {
        return new Bomb3(position);
    }
    dolly1(position) {
        return new Dolly1(position);
    }
    dolly2(position) {
        return new Dolly2(position);
    }
    dolly3(position) {
        return new Dolly3(position);
    }
}

class Aniripsa extends Fighter {
    constructor(fighter) {
        super(fighter);
    }
    
    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    this.hasAttacked = true;
                    enemy.getAttackedFighter(objectivePos, this.damage);
                    var change = { position: objectivePos, damage: (this.damage*(-1)) };
                    this.life += Math.floor(this.damage/2);
                    change.heal = { position: {x: this.x, y: this.y}, damage: Math.floor(this.damage/2) };
                    return change;
                } 
            }
        }
        return {};
    }

    attackOwn(player, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    this.hasAttacked = true;
                    player.getAttackedFighter(objectivePos, (this.damage)*(-1));
                    var change = { position: {x: -1, y: -1}, damage: 0 };
                    this.life += 30;
                    change.heal = { position: {x: objectivePos.x, y: objectivePos.y}, damage: this.damage };
                    return change;
                } 
            }
        }
        return {};
    }
}

class Sacrogito extends Fighter {
    constructor(fighter) {
        super(fighter);
    }
    
    getAttacked(damage) {
        this.life -= damage;
        this.damage += Math.floor(damage/2);
        if ( this.life <= 0 ) {
            this.dead = true;
        }
    }
}

class Feca extends Fighter {
    constructor(fighter) {
        super(fighter);
    }

    getAttacked(damage) {
        if ( damage > 0 ) {
            this.life -= Math.floor(damage/2);
            if ( this.life <= 0 ) {
                this.dead = true;
            }
        } else {
            this.life -= Math.floor(damage/2);
        }
    }
}

class Invocation extends Fighter{
    isInvocation() {
        return true;
    }
}

class Oso extends Invocation {
    constructor(position) {
        var fighter = {
            name : "oso",
            life : 50,
            damage : 30,
            reach : 2,
            x : position.x,
            y : position.y,
            movementPoints: 4
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 4;
    }
}

class Jalato extends Invocation {
    constructor(position) {
        var fighter = {
            name : "jalato",
            life : 40,
            damage : 20,
            reach : 2,
            x : position.x,
            y : position.y,
            movementPoints: 5
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 5;
    }
}

class Tofu extends Invocation {
    constructor(position) {
        var fighter = {
            name : "tofu",
            life : 15,
            damage : 15,
            reach : 3,
            x : position.x,
            y : position.y,
            movementPoints: 8
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 8;
    }
}

class Bomb extends Invocation {
    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    var change = enemy.getAttackedFighter(objectivePos, this.damage);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                        this.life = 0;
                        this.dead = true;
                    }
                    return change;
                } 
            }
        }
        return {};
    }

    attackOwn(player, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    this.hasAttacked = true;
                    this.life = 0;
                    this.dead = true;
                    player.getAttackedFighter(objectivePos, this.damage);
                    return { position: objectivePos, damage: (this.damage*(-1)) };
                } 
            }
        }
        return {};
    }
}

class Bomb1 extends Bomb {
    constructor(position) {
        var fighter = {
            name : "bomb1",
            life : 20,
            damage : 10,
            reach : 2,
            x : position.x,
            y : position.y,
            movementPoints: 1
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 1;
        this.damage += 5;
    }
}

class Bomb2 extends Bomb {
    constructor(position) {
        var fighter = {
            name : "bomb2",
            life : 30,
            damage : 20,
            reach : 2,
            x : position.x,
            y : position.y,
            movementPoints: 1
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 1;
        this.damage += 10;
    }
}

class Bomb3 extends Bomb {
    constructor(position) {
        var fighter = {
            name : "bomb3",
            life : 50,
            damage : 25,
            reach : 2,
            x : position.x,
            y : position.y,
            movementPoints: 1
        }
        super(fighter);
    }

    resetPoints() {
        this.hasAttacked = false;
        this.movementPoints = 1;
        this.damage += 15;
    }
}

class Dolly extends Invocation {
    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    var change = enemy.removePMFighter(objectivePos, this.damagePM);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                        return change;
                    }
                } 
            }
        }
        return {};
    }

    attackOwn(player, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    var change = player.addPMFighter(objectivePos, this.damagePM);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                        return change;
                    }
                } 
            }
        }
        return {};
    }
}

class Dolly1 extends Dolly {
    constructor(position) {
        var fighter = {
            name : "dolly1",
            life : 30,
            damage : 10,
            reach : 4,
            x : position.x,
            y : position.y,
            movementPoints: 3
        }
        super(fighter);
        this.damagePM = 1;
    }
}
class Dolly2 extends Dolly {
    constructor(position) {
        var fighter = {
            name : "dolly2",
            life : 50,
            damage : 10,
            reach : 4,
            x : position.x,
            y : position.y,
            movementPoints: 4
        }
        super(fighter);
        this.damagePM = 2;
    }
}
class Dolly3 extends Dolly {
    constructor(position) {
        var fighter = {
            name : "dolly3",
            life : 80,
            damage : 50,
            reach : 4,
            x : position.x,
            y : position.y,
            movementPoints: 5
        }
        super(fighter);
        this.damagePM = 3;
    }

    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    var change = enemy.getAttackedFighter(objectivePos, this.damage);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                    }
                    return change;
                } 
            }
        }
        return {};
    }
}


class Invocator extends Fighter {
    constructor(fighter) {
        super(fighter);
        this.latence = 0;
        this.cycle = 0;
        this.invocations = ['jalato', 'tofu', 'oso'];
    }

    attack(enemy, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if (enemy.getFighterAtPos(objectivePos) == undefined) {
                    if ( ! this.hasAttacked && this.latence == 0 && this.cycle < this.invocations.length ) {
                        this.hasAttacked = true;
                        var change = { position: {x: -1, y: -1}, damage: 0 };
                        this.latence = 2;
                        change.invocation = { position: { x: objectivePos.x, y: objectivePos.y }, 
                                              creature: this.invocations[this.cycle] };
                        this.cycle++;
                        return change;
                    }
                } else {
                    if ( ! this.hasAttacked ) {
                        this.hasAttacked = true;
                        enemy.getAttackedFighter(objectivePos, this.damage);
                        var change = { position: {x: objectivePos.x, y: objectivePos.y}, damage: (this.damage * (-1))};
                        return change;
                    }
                }
            }
        }
        return {};
    }

    resetPoints() {
        this.movementPoints = 4;
        if ( this.latence > 0 ) this.latence--;
        // this.hasAttacked = this.latence <= 0 ? false : true;
        this.hasAttacked = false;
    }
}

class Timador extends Invocator {
    constructor(fighter) {
        super(fighter);
        this.latence = 0;
        this.cycle = 0;
        this.invocations = ['bomb1', 'bomb2', 'bomb3'];
    }
}

class Sadida extends Invocator {
    constructor(fighter) {
        super(fighter);
        this.latence = 0;
        this.cycle = 0;
        this.invocations = ['dolly1', 'dolly2', 'dolly3'];
        this.damagePM = 2;
    }

    attackOwn(player, objectivePos) {
        if ( Math.abs(objectivePos.x - this.x) < this.reach ) {
            if ( Math.abs(objectivePos.y - this.y) < this.reach ) {
                if ( ! this.hasAttacked ) {
                    var change = player.addPMFighter(objectivePos, this.damagePM);
                    if ( Object.keys(change).length ) {
                        this.hasAttacked = true;
                        return change;
                    }
                } 
            }
        }
        return {};
    }
}


module.exports.Juego = Juego;
module.exports.FightPlace = FightPlace;
module.exports.Player = Player;
module.exports.Fighter = Fighter;
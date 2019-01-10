var model = require('./model.js');
describe("The game...", function () {
    var game;
    var usr1, usr2;
    var fightPlace;
    
    beforeEach(function () {
        game = new model.Juego();
        usr1 = {
            name: "Testing1",
            email: "Testing1@test.com",
            password: "1234",
            fighters: [
                {
                    name: "yopuka",
                    damage: 40,
                    life: 100,
                    reach: 3
                }
            ],
            selected: "yopuka",
            diplomas: 0,
            experience: 0,
            friends: ["Testing2@test.com"],
            online: true,
        };

        usr2 = {
            name: "Testing2",
            email: "Testing2@test.com",
            password: "1234",
            fighters: [
                {
                    name: "sacrogito",
                    damage: 40,
                    life: 100,
                    reach: 3
                }
            ],
            selected: "sacrogito",
            diplomas: 0,
            experience: 0,
            friends: ["Testing1@test.com"],
            online: true,
        };

        game.createFightPlace(usr1, usr2, (fightPlaceID) => {
            fightplace = game.getFightPlace(fightPlaceID);
        });
    });

    it("creates a Fight Place", function () {
        expect(game.fightPlaces.length).toEqual(1);
        expect(game.fightPlaces[0].id).toEqual("place-0");
        expect(game.fight)
    });

    it("obtains a Fight Place by id", function() {
        var fightPlace = game.getFightPlace("place-0");
        expect(fightPlace.id).toEqual(game.fightPlaces[0].id);
    });

    it("creates the Players", function() {
        var fightPlace = game.getFightPlace("place-0");
        expect(fightPlace.player1).toEqual(jasmine.any(model.Player));
        expect(fightPlace.player2).toEqual(jasmine.any(model.Player));
    });

    it("moves the fighters", function() {
        var fightPlace = game.getFightPlace("place-0");

        game.moveFighter("Testing1", "yopuka", {x: 4, y: 0}, "place-0");
        game.moveFighter("Testing2", "sacrogito", {x: 9, y: 9}, "place-0");

        var player = fightPlace.getPlayer("Testing1");
        var enemy = fightPlace.getPlayer("Testing2");

        expect(player.fighters[0].x).toEqual(4);
        expect(player.fighters[0].y).toEqual(0);

        expect(enemy.fighters[0].x).toEqual(9);
        expect(enemy.fighters[0].y).toEqual(9);
    });

    it("attacks the fighters", function() {
        var fightPlace = game.getFightPlace("place-0");

        fightPlace.player1.fighters[0].x = 5;
        fightPlace.player1.fighters[0].y = 5;
        fightPlace.player2.fighters[0].x = 5;
        fightPlace.player2.fighters[0].y = 6;

        var player = fightPlace.getPlayer("Testing1");
        var enemy = fightPlace.getEnemy("Testing1");
        var previousLife = enemy.fighters[0].life;
        var damage = player.fighters[0].damage;

        game.attackFighter("Testing1", "yopuka", {x: 5, y: 6}, "place-0");

        expect(enemy.fighters[0].life).toEqual(previousLife - damage);
    });

    describe("The Fight Place...", function() {
        beforeEach(() => {
            fightPlace = game.getFightPlace("place-0");
        });

        it("Obtains the player and the enemy", function() {
            var player = fightPlace.getPlayer("Testing1");
            var enemy  = fightPlace.getEnemy("Testing1");
            
            expect(player.name).toEqual("Testing1");
            expect(enemy.name).toEqual("Testing2");
        });

        it("Initializes both fighters positions", function() {
            var player = fightPlace.getPlayer("Testing1");
            var enemy  = fightPlace.getEnemy("Testing1");

            expect(player.fighters[0].x).toBeDefined();
            expect(player.fighters[0].y).toBeDefined();
            expect(enemy.fighters[0].x).toBeDefined();
            expect(enemy.fighters[0].y).toBeDefined();
        });

        it("Sets fighters initial positions correctly", function() {
            var player = fightPlace.getPlayer("Testing1");
            var enemy  = fightPlace.getEnemy("Testing1");

            expect(player.fighters[0].x).toEqual(3);
            expect(player.fighters[0].y).toEqual(0);
            expect(enemy.fighters[0].x).toEqual(10);
            expect(enemy.fighters[0].y).toEqual(9);
        });

        it("Manages turns correctly", function() {
            var turnPlayer;
            if ( fightPlace.player1.turn ) {
                turnPlayer = fightPlace.player1;
            } else {
                turnPlayer = fightPlace.player2;
            }
            var noTurnPlayer = fightPlace.getEnemy(turnPlayer.name);
            game.spendTurn(turnPlayer.name, "place-0");
            expect(noTurnPlayer.turn).toBeTruthy();
        });
    });
});
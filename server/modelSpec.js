var model = require('./model.js');
describe("The game...", function () {
    var game = new model.Juego();
    var usr1, usr2;
    var fightPlace;

    beforeEach(function () {
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
    });

    
    // describe("Comprobar la fase jugando", function () {
    //     beforeEach(function () {
    //         usr1.crearPartida("prueba");
    //         usr2.eligePartida("prueba");
    //     });
    //     it("Compruebo condiciones iniciales (cartas, partidas, usuario)", function () {
    //         expect(juego.usuarios).toBeDefined();
    //         expect(juego.usuarios.length).toEqual(2);
    //         expect(juego.partidas).toBeDefined();
    //         expect(juego.partidas.length).toEqual(1);
            
    //         expect(juego.partidas[0].fase.nombre).toEqual("jugando");
    //     });

    //     it("Los usuarios tienen un mazo", function () {
    //         expect(usr1.mazo).toBeDefined();
    //         expect(usr1.mazo.length).toEqual(30);
    //         expect(usr2.mazo).toBeDefined();
    //         expect(usr2.mazo.length).toEqual(30);
    //     });
    

    //     it("Los usuarios tiene mano (5 o 6 cartas)", function () {
    //         var cont1 = 0;
    //         var cont2 = 0;
    //         for (var i = 0; i < usr1.mazo.length; i++) {
    //             if (usr1.mazo[i].posicion == "mano") {
    //                 cont1++
    //             }
    //             if (usr2.mazo[i].posicion == "mano") {
    //                 cont2++
    //             }
    //         }
    //         if (usr1.turno.meToca()) {
    //             expect(cont1).toEqual(6);
    //             expect(cont2).toEqual(5);
    //         } else {
    //             expect(cont1).toEqual(5);
    //             expect(cont2).toEqual(6);
    //         }
    //     });

    //     it("Pepe crea una partida, juan la elige y se les asigna las zonas correspondientes", function () {
    //         expect(juego.usuarios[0].partida.nombre).toEqual("prueba");
    //         expect(usr1.partida.nombre).toEqual("prueba");
    //         expect(juego.usuarios[1].partida.nombre).toEqual("prueba");
    //         expect(juego.usuarios[0].zona.nombre).toEqual("arriba");
    //         expect(juego.usuarios[1].zona.nombre).toEqual("abajo");
    //         expect(usr1.partida.usuariosPartida.length).toEqual(2);
    //         if (usr1.turno.meToca()) {
    //             expect(usr2.turno.meToca()).toBe(false);
    //         } else {
    //             expect(usr2.turno.meToca()).toBe(true);
    //         }
    //     });

    //     it("Comprobar que funciona pasar turno", function () {
    //         usr1.turno = miturno;
    //         usr2.turno = nomiturno;
    //         usr1.pasarTurno();
    //         expect(usr1.turno.meToca()).toEqual(false);
    //         expect(usr2.turno.meToca()).toEqual(true);
    //     });

    //     it("Al jugar una carta, la carta pasa a la zona de ataque y se decrementa el elixir en 1", function () {
    //         //Forzamos el turno para el usr1
    //         usr1.turno = miturno;
    //         usr2.turno = nomiturno;
    //         //Localizamos una carta de coste 1
    //         var carta = usr1.obtenerUnaCarta();
    //         expect(carta).toBeDefined();
    //         carta.coste = 1;
    //         usr1.jugarCarta(carta);
    //         expect(usr1.elixir).toEqual(0);
    //         expect(usr1.consumido).toEqual(1);
    //         expect(carta.posicion).toEqual("ataque");
    //     });

    //     it("Se comprueba que una carta con coste 2 no se pueda jugar en el primer turno pero en el segundo sí", function () {
    //         //Forzamos el turno para el usr1
    //         usr1.turno = miturno;
    //         usr2.turno = nomiturno;
    //         //Localizamos una carta de coste 1 y otra de 2      
    //         var carta1 = usr1.obtenerUnaCarta();
    //         expect(carta1).toBeDefined();
    //         carta1.coste = 1;
    //         // Se comprueba que la carta de coste 1 se puede jugar y la de coste 2 no
    //         usr1.jugarCarta(carta1);
    //         expect(carta1.posicion).toEqual("ataque");
    //         expect(usr1.elixir).toEqual(0);
    //         var carta2 = usr1.obtenerUnaCarta();
    //         expect(carta2).toBeDefined();
    //         carta2.coste = 2;
    //         usr1.jugarCarta(carta2);
    //         expect(carta2.posicion).toEqual("mano");

    //         // Se pasa el turno de usr1 y usr2 para que se actualice el elixir
    //         usr1.pasarTurno();
    //         expect(usr1.elixir).toEqual(2);

    //         usr2.pasarTurno();

    //         // Se comprueba que ahora la carta 2 se puede jugar
    //         usr1.jugarCarta(carta2);
    //         expect(carta2.posicion).toEqual("ataque");
    //         expect(usr1.elixir).toEqual(0);
    //     });

    //     it("Un turno completo con ataque", function () {
    //         //Forzamos a que tenga 3 de elixir
    //         usr1.elixir = 3;
    //         usr1.turno = miturno;
    //         usr2.turno = nomiturno;
    //         //Localizamos una carta de coste 1
    //         var carta2 = usr2.obtenerUnaCarta();
    //         carta2.coste = 1;
    //         var vidasCarta2 = carta2.vidas;
    //         usr2.jugarCarta(carta2);
    //         usr2.pasarTurno();
    //         //Localizamos una carta y le ponemos coste 3
    //         var carta1 = usr1.obtenerUnaCarta();
    //         carta1.coste = 3;
    //         var vidasCarta1 = carta1.vidas;
    //         usr1.jugarCarta(carta1);
    //         //Atacamos con la de coste 3 a la de coste 1
    //         usr1.ataque(carta1, carta2);
    //         //Comprobamos si no tiene vidas
    //         expect(carta1.vidas).toEqual(vidasCarta1 - carta2.ataque);
    //         //expect(carta1.posicion).toEqual("cementerio");
    //         expect(carta2.vidas).toEqual(vidasCarta2 - carta1.ataque);
    //     });

    //     it("El juego termina si las vidas de un usuario sean 0", function () {
    //         usr1.turno = miturno;
    //         usr2.turno = nomiturno;
    //         usr2.vidas = 1;

    //         var carta1 = usr1.obtenerUnaCarta();
    //         expect(carta1).toBeDefined();
    //         expect(carta1.vidas).toBeGreaterThan(0);
    //         usr1.jugarCarta(carta1);
    //         usr1.ataque(carta1, usr2);
    //         expect(juego.partidas[0].fase.nombre).toEqual("final");
    //     });

    //     it("Si el numero de cartas excede el maximo de capacidad al final del turno se descartan las cartas sobrantes", function () {
    //         //Establecemos el turno para usr1
    //         usr1.turno = new model.MiTurno();
    //         usr2.turno = new model.NoMiTurno();
    //         //Usr1 coge cartas para tener mas de 10
    //         for (var i = 0; i < 6; i++) {
    //             usr1.cogerCarta();
    //         }
    //         var cartas = usr1.obtenerCartasMano();
    //         expect(cartas).toBeDefined();
    //         expect(cartas.length).toBeGreaterThan(10);
    //         //Al pasar turno se descartan las cartas sobrantes, enviandolas al cementerio
    //         usr1.pasarTurno();
    //         expect(usr1.obtenerCartasMano().length).toEqual(10);
    //     });
    // });

    // describe("Las fases de la partida...", function () {
    //     var juego;
    //     var usr1, usr2;
    //     var partida;

    //     beforeEach(function () {
    //         juego = new model.Juego();
    //         juego.agregarUsuario("Bart", 1);
    //         juego.agregarUsuario("Lisa", 2);
    //         juego.agregarUsuario("Maggie", 3);
    //         usr1 = juego.obtenerUsuario(1)
    //         usr2 = juego.obtenerUsuario(2);
    //         usr3 = juego.obtenerUsuario(3);

    //         usr1.crearPartida("lucha-a-muerte");
    //         partida = juego.obtenerPartida("lucha-a-muerte");
    //     });

    //     it("La partida empieza en fase inicial", function () {
    //         expect(partida.fase.nombre).toEqual("inicial");
    //     });

    //     it("La partida comienza cuando se le asignan dos usuarios", function () {
    //         usr2.eligePartida("lucha-a-muerte");

    //         expect(partida.fase.nombre).toEqual("jugando");
    //     });

    //     it("La partida entra en fase final cuando acaba", function () {
    //         partida.finPartida();

    //         expect(partida.fase.nombre).toEqual("final")
    //     });

    //     it("Solo se puede asignar usuario en la fase Inicial", function () {
    //         usr2.eligePartida("lucha-a-muerte");
    //         expect(partida.usuariosPartida.length).toEqual(2);

    //         usr3.eligePartida("lucha-a-muerte");

    //         partida.finPartida();
    //         usr3.eligePartida("lucha-a-muerte");

    //         expect(partida.usuariosPartida.length).toEqual(2);
    //     });
    // });
});
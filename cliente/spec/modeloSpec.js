describe("El juego de las cartas...", function() {
  var juego;
  var usr1,usr2;
  var miturno,nomiturno;

  beforeEach(function() {
    juego     = new Juego();
    usr1      = new Usuario("pepe");
    usr2      = new Usuario("juan");
    miturno   = new MiTurno();
    nomiturno = new NoMiTurno();
    juego.agregarUsuario(usr1);
    juego.agregarUsuario(usr2);
  });

  describe("Comprobar la fase inicial del juego", function() {
    it("Compruebo condiciones iniciales (cartas, partidas, usuario)", function() {
     expect( juego.usuarios        ).toBeDefined();
     expect( juego.usuarios.length ).toEqual(2);
     expect( juego.partidas        ).toBeDefined();
     expect( juego.partidas.length ).toEqual(0);

     usr1.crearPartida("prueba");
     expect(juego.partidas[0].fase.nombre).toEqual("inicial");
    });
  });

  describe("Comprobar la fase jugando", function() {
    beforeEach(function() {
      usr1.crearPartida("prueba");
      usr2.eligePartida("prueba");
    });
    it("Compruebo condiciones iniciales (cartas, partidas, usuario)", function() {
      expect( juego.usuarios        ).toBeDefined();
      expect( juego.usuarios.length ).toEqual(2);
      expect( juego.partidas        ).toBeDefined();
      expect( juego.partidas.length ).toEqual(1);
 
      usr1.crearPartida("prueba");
      expect(juego.partidas[0].fase.nombre).toEqual("jugando");
    });
  


    it("Los usuarios tienen un mazo", function(){
      expect( usr1.mazo        ).toBeDefined();
      expect( usr1.mazo.length ).toEqual(30);
      expect( usr2.mazo        ).toBeDefined();
      expect( usr2.mazo.length ).toEqual(30);
    });

    it("Los usuarios tiene mano (5 o 6 cartas)", function(){
      var cont1=0;
      var cont2=0;
      for(var i=0;i<usr1.mazo.length;i++){
        if (usr1.mazo[i].posicion=="mano"){
          cont1++
        }
        if (usr2.mazo[i].posicion=="mano"){
          cont2++
        }
      }
      if(usr1.turno.meToca()){
        expect(cont1).toEqual(6);
        expect(cont2).toEqual(5);
      } else {
        expect(cont1).toEqual(5);
        expect(cont2).toEqual(6);
      }
    });

    it("agregar pepe y juan el usuario al juego", function(){
      //juego.agregarUsuario(usr1);
      //juego.agregarUsuario(usr2);
      expect(juego.usuarios.length).toEqual(2);
      expect(juego.usuarios[0].nombre).toEqual("pepe");
      expect(usr1.mazo.length).toEqual(30);
      expect(juego.usuarios[1].nombre).toEqual("juan");
      expect(usr2.mazo.length).toEqual(30);
    });

    it("Pepe crea una partida, juan la elige y se les asigna las zonas correspondientes", function(){
      expect(juego.usuarios[0].partida.nombre).toEqual("prueba");
      expect(usr1.partida.nombre).toEqual("prueba");
      expect(juego.usuarios[1].partida.nombre).toEqual("prueba");
      expect(juego.usuarios[0].zona.nombre).toEqual("arriba");
      expect(juego.usuarios[1].zona.nombre).toEqual("abajo");
      expect(usr1.partida.usuariosPartida.length).toEqual(2);
      if (usr1.turno.meToca()){
        expect(usr2.turno.meToca()).toBe(false);
      } else {
        expect(usr2.turno.meToca()).toBe(true);
      }
    });

    it("Comprobar que funciona pasar turno",function(){
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      usr1.pasarTurno();
      expect(usr1.turno.meToca()).toEqual(false);
      expect(usr2.turno.meToca()).toEqual(true);
    });

    it("Al jugar una carta, la carta pasa a la zona de ataque y se decrementa el elixir en 1",function(){
      //Forzamos el turno para el usr1
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      //Localizamos una carta de coste 1
      var carta=usr1.obtenerUnaCarta();
      expect(carta).toBeDefined();
      carta.coste=1;
      usr1.jugarCarta(carta);
      expect(usr1.elixir).toEqual(0);
      expect(usr1.consumido).toEqual(1);
      expect(carta.posicion).toEqual("ataque");
    });

    it("Se comprueba que una carta con coste 2 no se pueda jugar en el primer turno pero en el segundo sí",function(){
      //Forzamos el turno para el usr1
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      //Localizamos una carta de coste 1 y otra de 2      
      var carta1=usr1.obtenerUnaCarta();      
      expect(carta1).toBeDefined();
      carta1.coste=1;          
      // Se comprueba que la carta de coste 1 se puede jugar y la de coste 2 no
      usr1.jugarCarta(carta1);
      expect(carta1.posicion).toEqual("ataque");
      expect(usr1.elixir).toEqual(0);    
      var carta2=usr1.obtenerUnaCarta();      
      expect(carta2).toBeDefined();
      carta2.coste=2;
      usr1.jugarCarta(carta2);
      expect(carta2.posicion).toEqual("mano");
    
      // Se pasa el turno de usr1 y usr2 para que se actualice el elixir
      usr1.pasarTurno();
      expect(usr1.elixir).toEqual(2);

      usr2.pasarTurno();

      // Se comprueba que ahora la carta 2 se puede jugar
      usr1.jugarCarta(carta2);
      expect(carta2.posicion).toEqual("ataque");
      expect(usr1.elixir).toEqual(0);      
    });

    it("Un turno completo con ataque", function(){
      //Forzamos a que tenga 3 de elixir
      usr1.elixir=3;
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      //Localizamos una carta de coste 1
      var carta2=usr2.obtenerUnaCarta();
      carta2.coste=1;
      var vidasCarta2=carta2.vidas;
      usr2.jugarCarta(carta2);
      usr2.pasarTurno();
      //Localizamos una carta y le ponemos coste 3
      var carta1=usr1.obtenerUnaCarta();
      carta1.coste=3;    
      var vidasCarta1=carta1.vidas;
      usr1.jugarCarta(carta1);
      //Atacamos con la de coste 3 a la de coste 1
      usr1.ataque(carta1,carta2);
      //Comprobamos si no tiene vidas
      expect(carta1.vidas).toEqual(vidasCarta1-carta2.ataque);
      //expect(carta1.posicion).toEqual("cementerio");
      expect(carta2.vidas).toEqual(vidasCarta2-carta1.ataque);
    });

    it("El juego termina cuando el usuario se queda sin cartas en el mazo", function(){
      usr1.turno=miturno;
      usr2.turno=nomiturno;

      for (var i=0; i<usr1.mazo.length-5;i++){
        usr1.pasarTurno();
        usr2.pasarTurno();
      }
      expect(usr1.turno.meToca()).toEqual(false);
      expect(usr2.turno.meToca()).toEqual(false);
      expect(juego.partidas[0].fase.nombre).toEqual("final");
    });

    it("El juego termina si las vidas de un usuario sean 0", function(){
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      usr2.vidas=1;

      var carta1=usr1.obtenerUnaCarta();
      expect(carta1).toBeDefined();
      expect(carta1.vidas).toBeGreaterThan(0);
      usr1.jugarCarta(carta1);
      usr1.ataque(carta1,usr2);
      expect(usr1.turno.meToca()).toEqual(false);
      expect(usr1.turno.meToca()).toEqual(false);
      expect(juego.partidas[0].fase.nombre).toEqual("final");
    });

    it ("Paso de turno automático, cuando las cartas han sido jugadas", function(){
      usr1.turno=miturno;
      usr2.turno=nomiturno;
      var carta1=usr1.obtenerUnaCarta();
      expect(carta1).toBeDefined();
      usr1.elixir=carta1.coste;
      usr1.jugarCarta(carta1); 
      usr1.pasarTurno();
      usr2.pasarTurno();
      var carta2=usr1.obtenerUnaCarta();
      expect(carta2).toBeDefined();
      usr1.elixir=carta2.coste;
      usr1.jugarCarta(carta2);
      usr1.ataque(carta1,usr2);
      expect(usr1.turno.meToca()).toEqual(true);
      expect(usr2.turno.meToca()).toEqual(false);
      usr1.ataque(carta2,usr2);
      expect(usr1.turno.meToca()).toEqual(false);
      expect(usr2.turno.meToca()).toEqual(true);     
    });

    it ("Si el numero de cartas excede el maximo de capacidad al final del turno se descartan las cartas sobrantes", function(){
      //Establecemos el turno para usr1
      usr1.turno=new MiTurno();
      usr2.turno=new NoMiTurno();
      //Usr1 coge cartas para tener mas de 10
      for(var i=0;i<6;i++){
        usr1.cogerCarta();
      }
      var cartas=usr1.obtenerCartasMano();
      expect( cartas       ).toBeDefined();
      expect( cartas.length).toBeGreaterThan(10);
      //Al pasar turno se descartan las cartas sobrantes, enviandolas al cementerio
      usr1.pasarTurno();
      expect( usr1.obtenerCartasMano().length).toEqual(10);
    });
  });

  

});

describe("Las fases de la partida...", function() {
  var juego;
  var usr1,usr2;
  var partida;

  beforeEach(function() {
    juego = new Juego();
    usr1  = new Usuario("Bart");
    usr2  = new Usuario("Lisa");
    usr3  = new Usuario("Maggie");

    juego.agregarUsuario(usr1);
    juego.agregarUsuario(usr2);
    juego.agregarUsuario(usr3);

    usr1.crearPartida("lucha-a-muerte");
    partida = juego.obtenerPartida("lucha-a-muerte");
  });
  
  it("La partida empieza en fase inicial", function() {
    expect(partida.fase.nombre).toEqual("inicial");
  });
  
  it("La partida comienza cuando se le asignan dos usuarios", function() {
    usr2.eligePartida("lucha-a-muerte");
  
    expect(partida.fase.nombre).toEqual("jugando");
  });

  it("La partida entra en fase final cuando acaba", function() {
    partida.finPartida();

    expect(partida.fase.nombre).toEqual("final")
  });

  it("Solo se puede asignar usuario en la fase Inicial", function() {
    usr2.eligePartida("lucha-a-muerte");
    expect(partida.usuariosPartida.length).toEqual(2);

    usr3.eligePartida("lucha-a-muerte");
    
    partida.finPartida();
    usr3.eligePartida("lucha-a-muerte");
    
    expect(partida.usuariosPartida.length).toEqual(2);
  });

});


function ClienteCom() {
    this.socket = undefined;
    this.nombrePartida = undefined;
    this.usrId = undefined;
    this.ini = function (usrid) {
        this.socket = io.connect();
        this.usrId = usrid;
        this.lanzarSocketSrv();
    }

    this.crearPartida = function (nombre) {
        this.nombrePartida = nombre;
        this.socket.emit('crearPartida', this.usrId, nombre);
        rest.obtenerPartidas();
    }
    this.elegirPartida = function (nombre) {
        this.nombrePartida = nombre;
        this.socket.emit('elegirPartida', this.usrId, nombre);
    };

    this.reconectarPartida = function() {
        this.socket.emit('reconectarPartida', this.usrId, this.nombrePartida);
    }

    this.pasarTurno = function() {
        this.socket.emit('pasarTurno', this.usrId, this.nombrePartida);
    };

    this.jugarCarta = function(nombre) {
        this.socket.emit('jugarCarta', this.usrId, this.nombrePartida, nombre);
    };

    this.obtenerCartasMano = function() {
		this.socket.emit("obtenerCartasMano",this.usrId,this.nombrePartida);
    };

    this.obtenerCartasAtaque = function() {
		this.socket.emit("obtenerCartasAtaque",this.usrId,this.nombrePartida);
    };
    
    this.meToca = function() {
        this.socket.emit("meToca", this.usrId);
    };

    this.obtenerDatosRival = function() {
        this.socket.emit("obtenerDatosRival", this.usrId);
    };

    this.atacar = function(atacante, objetivo) {
        this.socket.emit("atacar", this.usrId, this.nombrePartida, atacante, objetivo);
    };

    this.atacarRival = function(carta) {
        this.socket.emit("atacarRival", this.usrId, this.nombrePartida, carta);
    }

    this.obtenerResultado = function() {
        this.socket.emit("obtenerResultado", this.usrId, this.nombrePartida);
    }

    this.abandonarPartida = function() {
        this.socket.emit("abandonarPartida", this.usrId, this.nombrePartida);
    }

    this.obtenerMensajes = function() {
        this.socket.emit("obtenerMensajes", this.nombrePartida);
    }

    this.lanzarSocketSrv = function () {
        var cli = this;
        this.socket.on('connect', function () {
            console.log("Usuario conectado al servidor de WebSockets");
        });
        this.socket.on('partidaCreada', function (partidaId) {
            console.log("Usuario crea partida con id: " + partidaId);
        });
        this.socket.on('unidoAPartida', function (partidaId) {
            console.log("Usuario unido a partida id: " + partidaId);
        });
        this.socket.on('noUnido', function (partidaId) {
            console.log("El usuario no pudo unirse a la partida id: " + partidaId);
        });
        this.socket.on('pasaTurno', function(resultado) {
            console.log("Tienes el turno: " + resultado);
            $('.seleccionada').removeClass('seleccionada');
            $('.haAtacado').removeClass('haAtacado');
            mostrarTurnoActual(resultado);
        });
        this.socket.on('recibeTurno', function() {
            cli.obtenerCartasMano();
            cli.obtenerDatosRival();
            console.log("Te toca");
        })
        this.socket.on('mano', function(json) {
            var {mano, elixir} = json;
            console.table(mano);
            console.log("%c Elixir => " + elixir + " ", 'background: #8d3ac9; color: #fff; font-style: bold;');
            mostrarMano(mano);
        });
        
        this.socket.on('cartasAtaque', function(cartasAtaque) {
            if ( cartasAtaque ) {
                console.table(cartasAtaque);
                mostrarAtaque(cartasAtaque);
            } else {
                console.log("No hay cartas en ataque");
            }
        });

        this.socket.on('jugarCarta', function(usrid, nombreCarta) {
            console.log("El usuario " + usrid + " ha jugado la carta " + nombreCarta);
        });

        this.socket.on('noJugada', function (carta) {
            console.log("El usuario no pudo jugar la carta con coste: " + carta.coste);
        });

        this.socket.on('juegaCarta', function (data) {
            // Object destructuring :-)
            var { nombre, elixir, carta } =  data;
            cli.obtenerCartasMano();
            cli.obtenerCartasAtaque();
            cli.obtenerDatosRival();
            cli.obtenerResultado();
            console.log(nombre + " juega la carta correctamente con coste: " + carta.coste + ", elixir: " + elixir);
        });
        this.socket.on('datosRival', function (data) {
            mostrarAtaqueRival(data);
            console.log(data);
        });
        this.socket.on('aJugar', function() {
            cli.meToca();
            limpiarInicio();
            cli.obtenerMensajes();
            console.log("¡A jugar!");
        });
        this.socket.on('meToca', function(turno) {
            if ( turno ) {
                console.log("Es tu turno");
            } else {
                console.log("Aun no es tu turno, ansias");
            }
            cli.obtenerResultado();
            cli.obtenerCartasMano();
            cli.obtenerCartasAtaque();
            cli.obtenerDatosRival();
            mostrarTurnoActual(turno);
        });

        this.socket.on('respuestaAtaque', function(datos) {
            console.log("Resultado del ataque:");
            console.table(datos);
            cli.obtenerResultado();
            cli.obtenerCartasMano();
            cli.obtenerCartasAtaque();
            cli.obtenerDatosRival();
            mostrarAtaque();
        });

        this.socket.on('respuestaAtaqueRival', function(datos) {
            console.log("Resultado del ataque:");
            console.table(datos);
            cli.obtenerDatosRival();
            cli.obtenerCartasAtaque();
            cli.obtenerResultado();
        });

        this.socket.on('obtenerResultado', function(resultado) {
            mostrarResultado(resultado);
        });

        this.socket.on('finalizarPartida', function() {
            mostrarPartidaFinalizada();
            cli.obtenerMensajes();
        })

        this.socket.on('mostrarMensajes', function(mensajes) {
            mostrarMensajes(mensajes);
        })

        this.socket.on('reconectar', function(nombrePartida) {
            cli.meToca();
            cli.obtenerResultado();
            mostrarPasarTurno();
            cli.obtenerMensajes();
        });

        this.socket.on('partidaFinalizada', function(resultados) {
            mostrarResultado(resultados);
            mostrarResultadosFinales(resultados);
        })

    }
}
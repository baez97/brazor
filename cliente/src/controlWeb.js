function comprobarUsuario() {
    if ($.cookie("usr")) {
        console.log("User found in cookie! => ", $.cookie("usr"));
        rest.comprobarUsuario($.cookie("usr"));
    }
    else {
        mostrarFormularioNombre();
        mostrarFormularioRegistro();
        mostrarDescripcion();
    }
}

function abandonarPartida() {
    if ($.cookie("usr")) {
        $.removeCookie("usr");
        com.abandonarPartida();
        //location.reload();
    }
} 

function limpiar() {
    // elimina todo lo que sobra (inicializa)
    $('#formInicio').remove();
}


function mostrarFormularioNombre() {
    var cadena = `
    <div id="formInicio" class="contenedor" style="text-align: center">
        <h3 style="margin-top: 10px">Iniciar sesión</h3>
        <div id="inicio">
            <input id="emailLogin" type="text" class="form-control" name="email" placeholder="Email"</input>
            <input id="passwordLogin" type="password" class="form-control" name="password" placeholder="Contraseña"</input>
            <button type="button" id="inicioBtn" class="btn btn-md" style="background-color: #47260d; color: white">Aceptar</button>
        </div>
    </div>`;

    $('#RowIniciarSesion').append(cadena);
    $('#inicioBtn').on('click', function () {
        var email = $('#emailLogin').val();
        var password= $('#passwordLogin').val();


        $('#formInicio').remove();
        $('#formRegistro').remove();
        //rest.agregarUsuario(email);
        rest.loginUsuario(email, password);
    });
}

function mostrarFormularioRegistro() {
    var cadena = `
    <div id="formRegistro" class="contenedor" style="text-align: center">
        <h3 style="margin-top: 10px">Registrarse</h3>
        <div id="registro">
            <input id="nombre" type="text" class="form-control" name="nombre" placeholder="Nombre"</input>
            <input id="email" type="text" class="form-control" name="email" placeholder="Correo Electrónico"</input>
            <input id="password" type="password" class="form-control" name="password" placeholder="Contraseña"</input>
            <button type="button" id="registroBtn" class="btn btn-md" style="background-color: #47260d; color: white">Aceptar</button>
            <h3 style="color: red" id="invalid"></h3>
        </div>
    </div>`;

    $('#RowRegistrarse').append(cadena);
    $('#registroBtn').on('click', function () {
        var nombre = $('#nombre').val();
        var email = $('#email').val();
        var password = $('#password').val();

        if ( nombre == "" || email == "" || password == "") {
            $('#invalid').html('<b>Los tres campos son necesarios</b>');
        } else if (!isEmail(email)) {
            $('#invalid').html('<b>Email no válido</b>');
        } else {
            rest.registrarUsuario(nombre, email, password);
            $('#formInicio').remove();
            $('#formRegistro').remove();
        }
    });
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

function mostrarCrearPartida() {

    var cadena = `
        <div class="contenedor">
            <h2>O bien creala tú mismo</h2>
            <div id="formCrearPartida">
                <input id="nombrePartida" type="text" class="form-control" name="nombrePartida" placeholder="Nombre partida">
                <button type="button" id="crearPartidaBtn" class="btn btn-primary btn-md">Crear Partida</button>
            </div>
        </div>
    `;

    $('#RowCrearPartida').empty();
    $('#RowCrearPartida').append(cadena);

    $('#crearPartidaBtn').on('click', function () {
        var nombre = $('#nombrePartida').val();

        if ( nombre == "") {
            nombre = "Lucha";
        }

        $('#RowCrearPartida').remove();
        com.crearPartida(nombre);
        unirseAPartida(nombre);
    });
}

function mostrarListaPartidas(data) {

    $('#listGroupPartidas').remove();
    var lista = $('#listaPartidas');
    lista.empty();
    

    var cadena = '<div class="contenedor"><h2>Elige una partida<h2><h4>Lista de Partidas</h4><div class="list-group" style="overflow: auto; max-height: 300px" id="listGroupPartidas">';
    data.forEach( partida => {
        cadena += `<a href="#" class="list-group-item clickablePartida">${partida.nombre}</a>`;
    });
    cadena += '</div></div>';
    lista.append(cadena);
    $('.clickablePartida').on('click', function () {
        let nombre = $(this).text();
        com.elegirPartida(nombre);
        unirseAPartida(nombre);
    });
}

function unirseAPartida(nombre) {
    mostrarPreloader();
    let cadena = `Conectado a ${nombre}, esperando a otro jugador...`;
    $('#Descripcion').remove();
    $("#TituloPartida").css("marginTop", "200px");
    $('#TituloPartida').text(cadena);
}

function mostrarDescripcion() {
    var cadena = `<h1>Battle Cards</h1>`;
    $("#Descripcion").css("marginTop", "200px");
    $("#Descripcion").append(cadena);
}

function mostrarPreloader() {
    $('#spinner').empty();
    $('#spinner').removeClass('spinner');

    $('#spinner').addClass('spinner');
    $('#spinner').append(` 
        <div class="dot1"></div>
        <div class="dot2"></div>
    `);
}

function mostrarMano(mano) {
    $("#Mano").empty();
    var cadena = `<div class="deck mano">`;

    mano.forEach( carta => {
        var index = carta.nombre.indexOf("-");
        cadena += `
            <div class="carta" id="${carta.nombre}" draggable="true" ondragstart="drag(event)">
                <img style="width: 120px" src="cliente/img/${carta.nombre.slice(0, index)}.jpg" draggable="false" alt="Card image cap">
                <h5 class="card-title" style="text-align: center">${carta.nombre}</h5>
                <ul style="list-style-type: none; overflow: hidden; padding: 0">
                    <li style="display: inline-block; float: top; padding-left: 10px">❤️${carta.vidas}</li>
                    <li style="display: inline-block; float: top; padding-left: 10px">⚔️${carta.ataque}</li>
                    <li style="display: inline-block; float: top; padding-left: 10px">🔶${carta.coste}</li>
                </ul>
            </div>
        `;
    });

    cadena += `</div>`
    $('#Mano').append(cadena);
}

function limpiarContent() {
    $('#Descripcion').val('');
    $('#TituloPartida').hide();
    $('#spinner').empty();
    $('#spinner').removeClass('spinner');
    $('#AtaqueRival').empty();
    $('#Ataque').empty();
    $('#Mano').empty();
    $('#Elixir').empty();
    $('#FinPartida').empty();
}

function limpiarPanel() {
    $('#leftPanel').children().empty();
}

function limpiarInicio() {
    limpiarContent();
    limpiarPanel();
    mostrarPasarTurno();
}



function mostrarAtaque(ataque) {
    $('#Ataque').empty();
    var cadena = `<div class="deck ataque" ondrop="drop(event)" ondragover="allowDrop(event)">`;

    if ( ataque ) {
        ataque.forEach( carta => {
            var index = carta.nombre.indexOf("-");
            cadena += `
                <div class="carta" id="${carta.nombre}">
                    <img style="width: 120px" src="cliente/img/${carta.nombre.slice(0, index)}.jpg" draggable="false" alt="Card image cap">
                    <h5 class="card-title" style="text-align: center">${carta.nombre}</h5>
                    <ul style="list-style-type: none; overflow: hidden; padding: 0">
                        <li style="display: inline-block; float: top; padding-left: 10px">❤️${carta.vidas}</li>
                        <li style="display: inline-block; float: top; padding-left: 10px">⚔️${carta.ataque}</li>
                    </ul>
                </div>
            `;
        });

    }
    
    cadena += `</div>`
    $('#Ataque').append(cadena);

    if ( ataque ) {
        ataque.forEach( carta => {

            $(`#${carta.nombre}`).on('click', function(event) {
                $('.seleccionada').removeClass('seleccionada');
                $(this).addClass('seleccionada');
            })

            if ( carta.haAtacado ) {
                $(`#${carta.nombre}`).addClass("haAtacado");
            } else {
                $(`#${carta.nombre}`).removeClass("haAtacado");
            }
        })
    }

    
}

function mostrarAtaqueRival(data) {
    $('#AtaqueRival').empty();

    var cadena = `<div class="deck ataque">`;

    var mano = data.cartas;

    mano.forEach( carta => {
        var index = carta.nombre.indexOf("-");
        cadena += `
            <div class="carta" id="rival${carta.nombre}">
                <img style="width: 120px" src="cliente/img/${carta.nombre.slice(0, index)}.jpg" draggable="false" alt="Card image cap">
                <h5 class="card-title" style="text-align: center">${carta.nombre}</h5>
                <ul style="list-style-type: none; overflow: hidden; padding: 0">
                    <li style="display: inline-block; float: top; padding-left: 10px">❤️${carta.vidas}</li>
                    <li style="display: inline-block; float: top; padding-left: 10px">⚔️${carta.ataque}</li>
                </ul>
            </div>
        `;
    });
    cadena += `</div>`
    $('#AtaqueRival').append(cadena);

    mano.forEach( carta => {
        $(`#rival${carta.nombre}`).on('click', function(event) {
            var atacante = $('.seleccionada')
            if (atacante) {
                com.atacar(atacante.attr('id'), carta.nombre);
                atacante.removeClass('seleccionada');
            }
        })
    })
}

function mostrarResultado(data) {
    console.log("Intentando mostrar el resultado!");
    $("#Resultado").empty();
    $("#Resultado").append(`
        <div id="ContenedorResultado" class="contenedor">
            <h2 style="color: white">${data.jugador1.nombre}</h2>
            <h2 style="color: white">${data.jugador1.vidas}❤️ ${data.jugador1.elixir}🔶</h2>
            <h2 style="color: white">${data.jugador2.nombre}</h2>
            <h2 style="color: white">${data.jugador2.vidas}❤️ ${data.jugador2.elixir}🔶</h2>
            <button type="button" id="abandonarBtn" class="btn btn-md" style="background-color: #47260d; color: white">Abandonar Partida</button>            
        </div>
    `)

    $('#abandonarBtn').on('click', function(event) {
        abandonarPartida();
    })

    $('#ContenedorResultado').on('click', function(event) {
        var atacante = $('.seleccionada');
        console.log(atacante);
            if (atacante.length) {
                com.atacarRival(atacante.attr('id'));
                atacante.removeClass('seleccionada');
            }
    })
}

function mostrarResultadosFinales(resultados) {
    console.log("Mostrando resultados finales!!");
    limpiarContent();
    var cadena = `<h2>Partida finalizada</h2>`;

    let nombreGanador = resultados.jugador2.nombre;

    if ( resultados.jugador1.vidas ) {
        nombreGanador = resultados.jugador1.nombre;
    } 

    $('#ResultadosFinales').append(`
        <h2>Partida finalizada</h2>
        <h3>El ganador es:</h3>
        <h2>${nombreGanador}</h2>
        <br>
        <div class="table_wrapper" style="margin: auto">
            <table style="width: 100%">
                <tr>
                    <th scope="col"><h4>Nombre</h4></th>
                    <th scope="col"><h4>Vidas</h4></th>
                    <th scope="col"><h4>Elixir</h4></th>
                </tr>
                <tr>
                    <td><h4>${resultados.jugador1.nombre}</h4></td>
                    <td><h4>${resultados.jugador1.vidas}</h4></td>
                    <td><h4>${resultados.jugador1.elixir}</h4></td>
                </tr>
                <tr>
                    <td><h4>${resultados.jugador2.nombre}</h4></td>
                    <td><h4>${resultados.jugador2.vidas}</h4></td>
                    <td><h4>${resultados.jugador2.elixir}</h4></td>
                </tr>
            </table>
        </div>
    `)
    $('#ResultadosFinales').show()
}

function mostrarPasarTurno() {
    $("#PasarTurno").append(`
        <button type="button" id="pasarTurnoBtn" class="btn btn-md" style="background-color: #c27941; color: white">Pasar Turno</button>
    `);

    $('#pasarTurnoBtn').on('click', function () {
        com.pasarTurno();
    });
}

function mostrarMensajes(mensajes) {
    if ( mensajes ) {
        var lista = $('#Mensajes');
        lista.empty();
        
        var cadena = '<div class="contenedor" style="margin-top: 10px"><h4>Mensajes</h4><div class="list-group" style="overflow: auto; max-height: 200px" id="listaMensajes">';
        mensajes.forEach( mensaje => {
            cadena += `<a href="#" class="list-group-item">${mensaje}</a>`;
        });
        cadena += '</div></div>';
        lista.append(cadena);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("nombreCarta", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("nombreCarta");
    com.jugarCarta(data);
}

function mostrarPartidaFinalizada(data) {
    limpiarContent();
    $('body').css("background-color","#e5e5e5");
    $('#FinPartida').append(`
        <h1 id="Titulo"><b>Partida Finalizada</b></h1>
        <div id="ContenedorResultado" class="contenedor">
            <h2 style="color: white">${data.jugador1.nombre}</h2>
            <h2 style="color: white">${data.jugador1.vidas}❤️ ${data.jugador1.elixir}🔶</h2>
            <h2 style="color: white">${data.jugador2.nombre}</h2>
            <h2 style="color: white">${data.jugador2.vidas}❤️ ${data.jugador2.elixir}🔶</h2>
            <button type="button" id="abandonarBtn" class="btn btn-md" style="background-color: #47260d; color: white">Abandonar Partida</button>            
        </div>
    `)
}

function mostrarTurnoActual(esMiTurno) {
    console.log("Keep calm, I am trying");
    $('#TurnoActual').empty();

    if ( esMiTurno ) {
        var cadena = `
            <div id="turno" style="margin-top: 20px; padding: 20px; border-radius:20px; color: white; background-color: #009900; text-size: 15px; text-align: center">
                <b>Es tu turno</b>
            </div>
        `
    } else {
        var cadena = `
            <div id="turno" style="margin-top: 20px; padding: 20px; border-radius:20px; color: white; background-color: #cc0000; text-size: 15px; text-align: center">
                <b>No es tu turno</b>
            </div>
        `
    }

    $('#TurnoActual').append(cadena);
}




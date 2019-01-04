function ClienteRest() {
    var cli = this;

    this.loginUser = function (email, password, errorHandler) { 
        $.ajax({
            type: 'POST',
            url: '/loginUser/',
            data: JSON.stringify({email: email, password: password}),
            success: function(data) {
                if ( data == undefined ) {
                    errorHandler("No se ha podido iniciar sesión");
                } else {
                    com.ini(data);
                    localStorage.setItem("user", JSON.stringify(data));
                    location.href = '/main';
                    //mostrarCrearPartida();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                errorHandler(errorThrown);
            },
            contentType: 'application/json',
            dataType: 'json'
        })
    },

    this.registerUser = function (user, errorHandler) {
        $.ajax({
            type: 'POST',
            url: '/registerUser/',
            data: JSON.stringify(user),
            success: function (data) {
                localStorage.setItem("firstTime", "1");
                cli.loginUser(user.email, user.password);
            },
            error: function(error) {
                errorHandler("No se ha podido registrar");
            },
            contentType: 'application/json',
            dataType: 'json'
        });
    }


    this.obtenerPartidas = function () {
        $.getJSON("/obtenerPartidas", function (data) {
            console.log(data);
            mostrarListaPartidas(data);
        });
    }
    this.agregarUsuario = function (nombre) {
        $.ajax({
            type: 'GET',
            url: '/agregarUsuario/' + nombre,
            success: function (data) {
                console.log("Usuario agregado con id: " + data.usr)
                com.ini(data.usr);
                $.cookie("usr", data.usr);
                cli.obtenerPartidas();
                mostrarCrearPartida();
            },
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    this.comprobarUsuario = function (usrid) {
        $.getJSON("/comprobarUsuario/" + usrid, function (data) {
            console.log(data);
            if ( data.notFound ) {
                mostrarFormularioNombre();
                mostrarFormularioRegistro();
                mostrarDescripcion();
            } else if (data.partida) {
                com.ini(usrid);
                com.nombrePartida = data.partida;
                com.reconectarPartida();
            } else {
                com.ini(usrid);
                cli.obtenerPartidas();
                mostrarCrearPartida();
            }
        });
    }

    

    this.registrarUsuario = function (nombre, email, clave) {
        $.ajax({
            type: 'POST',
            url: '/registrarUsuario/',
            data: JSON.stringify({ nombre: nombre, email: email, clave: clave }),
            success: function (data) {
                if (!data.email) {
                    showError("No se ha podido registrar");
                    console.log("No se ha podido registrar");
                } else {
                    cli.loginUsuario(data.email, data.password);
                    console.log("Registro correcto => " + data.email);
                }
            },
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    

    this.eliminarUsuario = function () {
        var usr = JSON.parse($.cookie("usr"));
        $.ajax({
            type: 'DELETE',
            url: '/eliminarUsuario/' + usr._id,
            data: '{}',
            success: function (data) {
                if (data.resultados == 1) {
                    $.removeCookie("usr");
                    limpiarContent();
                    limpiarInicio();
                    mostrarFormularioNombre();
                    mostrarFormularioRegistro();
                }
            },
            contentType: 'application/json',
            dataType: 'json'
        });
    }
}
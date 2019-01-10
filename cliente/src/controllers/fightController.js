// INITIAL FIGHTPLACE
function connectToSocket() {
    com.ini(player);
    com.simulateFightPlace(player, enemy, fightPlaceID);
    com.joinFight(fightPlaceID);
}

function setFightPlace(fP) {
    fightPlace = fP;
    //hideMovement();
    localStorage.setItem("fightPlace", JSON.stringify(fightPlace));
    paintFighters();
}

// PAINTING FIGHTERS
function paintFighters() {
    var playerFighters, enemyFighters, turn;
    if ( fightPlace.player1.name === player.name ) {
        playerFighters = fightPlace.player1.fighters;
        enemyFighters = fightPlace.player2.fighters;
        turn = fightPlace.player1.turn;
    } else {
        playerFighters = fightPlace.player2.fighters;
        enemyFighters = fightPlace.player1.fighters;
        turn = fightPlace.player2.turn;
    }

    playerFighters.forEach( (fighter) => {
        $(`.${player.name}.${fighter.name}`).removeClass(`icon ${fighter.name}`);
        if ( !fighter.dead ) {
            $(`#C-${fighter.x}-${fighter.y}`).addClass("icon " + fighter.name + " " + player.name);
            $(`#C-${fighter.x}-${fighter.y} .tooltiptext`).html(`💙 ${fighter.life} &nbsp 🔥 ${fighter.damage}`);
            if ( turn ) {
                $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", `selectFighter("${fighter.name}")`);
            } else {
                $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", `hideMovement()`);
            }
        }
    });

    enemyFighters.forEach( (fighter) => {
        $(`.${enemy.name}.${fighter.name}`).removeClass(`icon ${fighter.name}`);
        if ( !fighter.dead ) {
            $(`#C-${fighter.x}-${fighter.y}`).addClass("icon " + fighter.name + " " + enemy.name);
            $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", "hideMovement()");
            $(`#C-${fighter.x}-${fighter.y} .tooltiptext`).html(`❤️ ${fighter.life} &nbsp 🔥 ${fighter.damage}`);      
        }
    });

    if ( turn ) {
        $("#turn-button").removeClass("no-turn-button");
        $("#turn-button").addClass("pass-turn-button");
        $("#turn-button").attr("onclick", "spendTurn()");
    } else {
        $("#turn-button").removeClass("pass-turn-button");
        $("#turn-button").addClass("no-turn-button");
        $("#turn-button").attr("onclick", "hideMovement()");
    }

    if ( change && Object.keys(change).length ) {
        var position = change.position;
        var damage   = change.damage;
        var heal     = change.heal;

        $(`#C-${position.x}-${position.y}`).append(`<div class='damage'>${damage}</div>`);
        
        console.log(heal);
        if ( heal != undefined ) {
            $(`#C-${heal.position.x}-${heal.position.y}`).append(`<div class='heal'>+${heal.damage}</div>`);
        }
        
        if ( change.end != undefined ) {
            fightIsOver(change.end);
        }

        change = 0;
    }
}

function selectFighter(fighterName) {
    var fighter = getFighter(fighterName);
    $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", `reselectFighter("${fighter.name}")`);
    var movements = getReachable(fighter, fighter.movementPoints);
    movements.forEach ( movement => {
        if ( ! $(`#C-${movement.x}-${movement.y}`).hasClass("icon") ) {
            $(`#C-${movement.x}-${movement.y}`).addClass("green")
            $(`#C-${movement.x}-${movement.y}`).attr("onclick", `moveFighter("${fighterName}", ${movement.x}, ${movement.y})`);
        }
    })
}

function reselectFighter(fighterName) {
    var fighter = getFighter(fighterName);
    var attacks = getReachable(fighter, fighter.reach);
    hideMovement();
    if ( ! fighter.hasAttacked ) {
        attacks.forEach ( attack => {
            var cell = $(`#C-${attack.x}-${attack.y}`);
            if ( ! cell.hasClass("icon") ) {
                cell.addClass("blue");
            } else {
                cell.addClass("reached");
                if ( cell.hasClass(enemy.name) ) {
                    cell.attr("onclick", `attackFighter("${fighterName}", ${attack.x}, ${attack.y})`);
                } else {
                    cell.attr("onclick", `attackOwnFighter("${fighterName}", ${attack.x}, ${attack.y})`);
                }
            }
        });
    } else {
        attacks.forEach ( attack => {
            var cell = $(`#C-${attack.x}-${attack.y}`);
            if ( ! cell.hasClass("icon") ) {
                cell.addClass("light-blue");
            } 
        });
    }
    
}

function getFighter(fighterName) {
    if ( fightPlace.player1.name == player.name ) { player = fightPlace.player1 }
    else { player = fightPlace.player2 }
    return player.fighters.find((fighter) => { 
        return fighter.name === fighterName;
    });
}

function getReachable(fighter, reach) {
    var x = fighter.x; var y = fighter.y;
    var reachableCells = [];
    for ( let i = 0; i <= reach; i++ ) {
        for ( let j = 0; j < reach-i; j++ ) {
            if ( i == 0 && j == 0 ) continue;
            reachableCells.push({ x: x +j, y: y +i });
            if ( j != 0 ) reachableCells.push({ x: x -j, y: y +i }); 
            if ( i != 0 ) reachableCells.push({ x: x +j, y: y -i }); 
            if ( j != 0 && i != 0 ) reachableCells.push({ x: x -j, y: y -i });
        }
    }
    return reachableCells;
}

function moveFighter(fighterName, x, y) {
    com.moveFighter(fighterName, {x: x, y: y});
}

function attackFighter(fighterName, x, y) {
    com.attackFighter(fighterName, {x: x, y: y});
}

function attackOwnFighter(fighterName, x, y) {
    com.attackOwnFighter(fighterName, {x: x, y: y});
}


function updateDisplay(fP) {
    setFightPlace(fP);
    hideMovement();
    paintFighters();
}

function generateArena() {
    var chain = ``;
    for ( let i = 0; i < 10; i++ ) {
        chain+= "<tr>";
        for ( let j = 0; j < 14; j++ ) {
            chain+= `<td id="C-${j}-${i}" onclick="hideMovement()">
                <span class="tooltiptext">Tooltip text</span>
            </td>`
        }
        chain+= "</tr>";
    }

    $("#arena").append(chain);
}

function getFightPlace() {
    com.getFightPlace(fightPlaceID);
    return f;
}

function hideMovement() {
    $(".green").attr("onclick", "hideMovement()");
    $(".green").removeClass("green");
    $(".blue").attr("onclick", "hideMovement()");
    $(".blue").removeClass("blue");
    $(".light-blue").removeClass("light-blue");
    $(".reached").attr("onclick", "hideMovement()");
    $(".reached").removeClass("reached");
    $(".damage").fadeOut(1700);
    $(".heal").fadeOut(1700);
    paintFighters();
}

function addChange(c) {
    change = c;
}

function spendTurn() {
    com.spendTurn();
}

function fightIsOver(loserName) {
    if ( player.name == loserName ) {
        showAlert("Qué verguenza...");
    } else {
        localStorage.setItem("hasWonAFight", "true");
        showAlert("No está nada mal");
    }
    localStorage.removeItem("fightPlace")
    localStorage.removeItem("player")
    localStorage.removeItem("enemy")
    localStorage.removeItem("fightPlaceID")
}

function showAlert(message) {
    $(document).ready( function() {
        $("#alert-fluid-container").removeClass("hidden");
        $("#alert-background").removeClass("hidden");
        $(".alert-title").text(message);
        $("#alertButton").attr("onclick", "location.href='/main'");
    })
}

var com          = new FightCom();
var player       = JSON.parse(localStorage.player);
var enemy        = JSON.parse(localStorage.enemy);
var fightPlaceID = JSON.parse(localStorage.fightPlaceID);
var change       = 0;

var fightPlace;

connectToSocket(); // SETS THE fightPlace variable

$(document).ready( function() {
    generateArena();
});
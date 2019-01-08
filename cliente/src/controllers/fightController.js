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
    var playerFighters, enemyFighters;
    if ( fightPlace.player1.name === player.name ) {
        playerFighters = fightPlace.player1.fighters;
        enemyFighters = fightPlace.player2.fighters;
    } else {
        playerFighters = fightPlace.player2.fighters;
        enemyFighters = fightPlace.player1.fighters;
    }

    playerFighters.forEach( (fighter) => {
        $(`.${player.name}.${fighter.name}`).removeClass(`icon ${fighter.name}`);
        console.log(`.${player.name}.${fighter.name} is removed`);
        $(`#C-${fighter.x}-${fighter.y}`).addClass("icon " + fighter.name + " " + player.name);
        $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", `selectFighter("${fighter.name}")`);
        $(`#C-${fighter.x}-${fighter.y} .tooltiptext`).text(`${fighter.life}-${fighter.damage}`)
    });

    enemyFighters.forEach( (fighter) => {
        $(`.${enemy.name}.${fighter.name}`).removeClass(`icon ${fighter.name}`);
        $(`#C-${fighter.x}-${fighter.y}`).addClass("icon " + fighter.name + " " + enemy.name);
        $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", "hideMovement()");
        $(`#C-${fighter.x}-${fighter.y} .tooltiptext`).text(`${fighter.life}-${fighter.damage}`)        
    });
}

function selectFighter(fighterName) {
    var fighter = getFighter(fighterName);
    $(`#C-${fighter.x}-${fighter.y}`).attr("onclick", `reselectFighter("${fighter.name}")`);
    var movements = getReachable(fighter, 3);
    movements.forEach ( movement => {
        if ( ! $(`#C-${movement.x}-${movement.y}`).hasClass("icon") ) {
            $(`#C-${movement.x}-${movement.y}`).addClass("green")
            $(`#C-${movement.x}-${movement.y}`).attr("onclick", `moveFighter("${fighterName}", ${movement.x}, ${movement.y})`);
        }
    })
}

function reselectFighter(fighterName) {
    var fighter = getFighter(fighterName);
    var attacks = getReachable(fighter, 4);
    hideMovement();
    attacks.forEach ( attack => {
        if ( ! $(`#C-${attack.x}-${attack.y}`).hasClass("icon") ) {
            $(`#C-${attack.x}-${attack.y}`).addClass("blue");
        } else {
            $(`#C-${attack.x}-${attack.y}`).addClass("reached");
            $(`#C-${attack.x}-${attack.y}`).attr("onclick", `attackFighter("${fighterName}", ${attack.x}, ${attack.y})`);
        }
    });
}

function getFighter(fighterName) {
    console.log("GETTING THE FIGHTER");
    if ( fightPlace.player1.name == player.name ) { player = fightPlace.player1 }
    else { player = fightPlace.player2 }
    return player.fighters.find((fighter) => { 
        return fighter.name === fighterName;
    });
}

function getReachable(fighter, reach) {
    // var reach = fighter.reach;
    var x = fighter.x; var y = fighter.y;
    var reachableCells = [];
    for ( let i = 0; i <= reach; i++ ) {
        for ( let j = 0; j < reach-i; j++ ) {
            reachableCells.push({ x: x +j, y: y +i });
            if ( j != 0 ) reachableCells.push({ x: x -j, y: y +i }); 
            if ( i != 0 ) reachableCells.push({ x: x +j, y: y -i }); 
            if ( j != 0 && i != 0 ) reachableCells.push({ x: x -j, y: y -i });
        }
    }
    return reachableCells;
}

function moveFighter(fighterName, x, y) {
    console.log("MOVING FIGHTER " + fighterName + " " + x + "-" + y);
    com.moveFighter(fighterName, {x: x, y: y});
}

function attackFighter(fighterName, x, y) {
    console.log("ATTACKING FIGHTER " + fighterName + " " + x + "-" + y);
    com.attackFighter(fighterName, {x: x, y: y});
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
    console.log("SORRY, I'M HIDDING");
    $(".green").attr("onclick", "hideMovement()");
    $(".green").removeClass("green");
    $(".blue").attr("onclick", "hideMovement()");
    $(".blue").removeClass("blue");
    $(".reached").attr("onclick", "hideMovement()");
    $(".reached").removeClass("reached");
    paintFighters();
}

// function paintMovement(fighter) {
//     var movements = getReachable(fighter.x, fighter.y, 4);
//     movements.forEach( (movement) => {
//         $(`#C-${movement.x}-${movement.y}`).addClass("green");
//         $(`#C-${movement.x}-${movement.y}`).click(function(e) {
//             moveFighter(fighter, movement);
//         });
//     });
// }

// function paintAttack(fighter) {
//     var attacks = getReachable(fighter.x, fighter.y, 3);
//     attacks.forEach( (attack) => {
//         $(`#C-${attack.x}-${attack.y}`).addClass("blue");
//         $(`#C-${attack.x}-${attack.y}`).click(function(e) {
//             console.log("Atacando a la celda " + attack.x);
//         });
//     });
// }

// function moveFighter(fighter, movement) {
//     $(`#C-${fighter.x}-${fighter.y}`).removeClass(`icon ${fighter.name}`);
//     com.moveFighter(fighter.name, movement);
//     fighter.x = movement.x;
//     fighter.y = movement.y;
//     paintFighters();
// }





var com          = new FightCom();
var player       = JSON.parse(localStorage.player);
var enemy        = JSON.parse(localStorage.enemy);
var fightPlaceID = JSON.parse(localStorage.fightPlaceID);

var fightPlace;

connectToSocket(); // SETS THE fightPlace variable

$(document).ready( function() {
    generateArena();
});
var races = {
    yopuka : {
        title: `El corazón de Yopuka`,
        description : 
            `¡Los yopukas son unos intrépidos y temerarios 
            guerreros! Lo cierto es que los yopukas saben hacer 
            hablar a sus armas. De hecho, meterse en una pelea 
            al menos una vez al día es para ellos señal de buena 
            salud. Su impetuoso temperamento hace que sean unos 
            maravillosos paladinos.`,
        damage : 50,
        life: 100,
        reach: 3
    },
    feca : {
        title: `El escudo de Feca`,
        description : 
            `Los fecas son leales protectores, siempre a la 
            defensiva. Son muy apreciados por los grupos de 
            aventureros gracias a sus armaduras elementales 
            y a su capacidad para encajar los golpes.`,
        damage : 15,
        life: 100,
        reach: 4
    },
    ocra : {
        title: `El alcance de Ocra`,
        description : 
            `Los ocras son arqueros tan orgullosos como precisos. 
            Son aliados de gran valor contra los adeptos del 
            cuerpo a cuerpo. Aun a distancia, saben alcanzar con 
            sus afilados proyectiles el orificio más minúsculo 
            que el enemigo deje sin vigilancia.`,
        damage : 30,
        life: 70,
        reach: 8
    },
    aniripsa : {
        title: `Las manos de Aniripsa`,
        description : 
            `Los aniripsas son sanadores que curan con una simple 
            palabra. Utilizan el poder de las palabras para sanar 
            a sus aliados y, a veces, también para herir a sus 
            enemigos. Algunos aniripsas se han convertido, incluso, 
            en expertos del verbo y exploradores de idiomas 
            olvidados..`,
        damage : 20,
        life: 70,
        reach: 4
    },
    timador: {
        title: `La astucia de los Timadores`,
        description: 
            `¡Los tymadores son grandes estrategas manipuladores 
            de bombas! Como todo el mundo sabe, utilizan la pólvora 
            como nadie y, cuando se trata de hacer explotar a sus 
            enemigos, no se hacen de rogar. `,
        damage: 35,
        life: 90,
        reach: 3
    }, 
    osamodas: {
        title: `El látigo de Osamodas`,
        description: 
            `¡Los osamodas son domadores natos! Tienen el poder de 
            invocar criaturas y resultan ser excelentes adiestradores. 
            Corre el rumor de que confeccionan sus prendas con la piel 
            de sus enemigos, pero a ver quién se atreve a preguntarles 
            cara a cara si es cierto.`,
        damage: 35,
        life: 80,
        reach: 2
    },
    sadida: {
        title: `El zapato de Sadida`,
        description: 
            `¡Los sadidas son invocadores que envenenan la vida de sus 
            enemigos! Lo que procura más satisfacción a un sadida es 
            amaestrar las zarzas para convertirlas en armas aterradoras, 
            y confeccionar muñecas de guerra y de curación.`,
        damage: 30,
        life: 85,
        reach: 3
    },
    sacrogito: {
        title: `La sangre de Sacrógito`,
        description:
            `¡Los sacrógritos son berserkers cuya fuerza aumenta cuando 
            reciben golpes! Puesto que no temen ni al dolor ni a las 
            heridas, suelen estar en primera línea, ¡preparados para el 
            combate! El sacrógrito es el compañero ideal para pasar tus 
            largas noches luchando...`,
        damage: 10,
        life: 200,
        reach: 2
    }
}

var selected = 'yopuka';

module.exports.races = races;

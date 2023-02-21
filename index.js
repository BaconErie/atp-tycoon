kaboom({
    width: 1000,
    height: 600
});

// LOAD SOME SPRITES
loadSprite('citric-acid-cycle', 'images/citric-acid-cycle.png');
loadSprite('adp', 'images/adp.png');
loadSprite('atp', 'images/atp.png')
loadSprite('nad+', 'images/nad+.png');
loadSprite('glucose', 'images/glucose.png');
loadSprite('phosphorylation', 'images/phosphorylation.png');
loadSprite('6c', 'images/6c.png');
loadSprite('3c', 'images/3c.png');
loadSprite('energy_harvester', 'images/nrg_harvester.png');
loadSprite('transport_protein', 'images/transport_protein.png');
loadSprite('2c', 'images/2c.png');
loadSprite('acetylcoa-creation', 'images/acetylcoa-creation.png');
loadSprite('asdf', 'images/asdf.png');
loadSprite('buy', 'images/buy.png');

layers(['pro'], 'game')

var buy = add([
    sprite('buy'),
    pos(286, 72), 
    area(),
    scale(2),
    origin("center")
]);

buy.cost = 200;
buy.callback = addEnergyHarvester;

buy.onClick(() => {
    buy.callback()
});

var phosphorylation = add([
    sprite('phosphorylation'),
    pos(105, 78), 
    area(),
    scale(2),
    origin("center")
]);
 
phosphorylation.queue = [];
phosphorylation.working = [];



var energyHarvester = null;

function addEnergyHarvester() {
    energyHarvester = add([
        sprite('energy_harvester'),
        pos(356, 70), 
        area(),
        scale(2),
        origin("center")
    ]);

    energyHarvester.queue = [];
    energyHarvester.working = [];

    console.log(buy.pos)
    buy.pos = pos(110, 459);
    buy.callback = addTransportProtein;
    buy.cost = 200;
}

var transportProtein = null;

function addTransportProtein() {
    transportProtein = add([
        sprite('transport_protein'),
        pos(647, 70), 
        area(),
        scale(2),
        origin("center")
    ]);

    transportProtein.queue = [];
    transportProtein.working = [];
}

var acetylCoaMachine = null;

function addAcetylCoaMachine() {
    acetylCoaMachine = add([
        sprite('acetylcoa-creation'),
        pos(849, 138), 
        area(),
        scale(2),
        origin("center")
    ]);
}

var citricAcidCycle = null;

function addCitricAcidCycle() {
    citricAcidCycle = add([
        sprite('citric-acid-cycle'),
        pos(815, 404), 
        area(),
        scale(2),
        origin("center"),
        layer('pro')
    ]);
}

// const asdf = add([
//     sprite('asdf'),
//     pos(356, 70), 
//     area(),
//     scale(2),
//     origin("center")
// ]);

const adp1 = add([
    sprite('adp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin("center")
])

const adp2 = add([
    sprite('adp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const atp1 = add([
    sprite('atp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const atp2 = add([
    sprite('atp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const glucose = add([
    sprite('glucose'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const sixC = add([
    sprite('6c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const threeC1 = add([
    sprite('3c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

const threeC2 = add([
    sprite('3c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center')
])

let clicked = null;

onUpdate(() => {
    for (let sprite of get()) {
        if (sprite.isClicked()) {
            clicked = sprite
            console.log(sprite.pos)
        }
    }
})

const SPEED = 20;
const MULTIPLIER = 20;

onKeyDown("right", () => {
    console.log('OH MY GOD')

    if (isKeyDown("space")) {
        clicked.move(SPEED*MULTIPLIER, 0)
    } else {
        clicked.move(SPEED, 0)
    }
})

onKeyDown("up", () => {
    if (isKeyDown("space")) {
        clicked.move(0, -SPEED*MULTIPLIER)
    } else {
        clicked.move(0, -SPEED)
    }
})

onKeyDown("left", () => {
    if (isKeyDown("space")) {
        clicked.move(-SPEED*MULTIPLIER, 0)
    } else {
        clicked.move(-SPEED, 0)
    }
})

onKeyDown("down", () => {

    if (isKeyDown("space")) {
        clicked.move(0, SPEED*MULTIPLIER)
    } else {
        clicked.move(0, SPEED)
    }
})
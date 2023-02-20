kaboom({
    width: 1000,
    height: 600
});

// LOAD SOME SPRITES
loadSprite('adp', 'images/adp.png');
loadSprite('atp', 'images/atp.png')
loadSprite('nad+', 'images/nad+.png');
loadSprite('glucose', 'images/glucose.png');
loadSprite('phosphorylation', 'images/phosphorylation.png');
loadSprite('6c', 'images/6c.png');
loadSprite('3c', 'images/3c.png');
loadSprite('energy_harvester', 'images/nrg_harvester.png')

const phosphorylation = add([
    sprite('phosphorylation'),
    pos(105, 78), 
    area(),
    scale(2),
    origin("center")
]);

const energy_harvester = add([
    sprite('energy_harvester'),
    pos(356, 70), 
    area(),
    scale(2),
    origin("center")
]);

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
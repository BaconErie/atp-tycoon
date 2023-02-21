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
loadSprite('buy-background', 'images/buy-background.png');

layers(['prompt', 'pro'], 'game')

var buyPromptStuff = [];

function promptBuy() {
    buyPromptStuff.push(add([
        sprite('buy-background'),
        pos(500, 300), 
        area(),
        scale(2),
        origin("center"),
        layer('prompt')
    ]));
    
    buyPromptStuff.push(add([
        text(`Are you sure you want to buy ${buy.string} for $${buy.cost}?`, {
            size: 30,
            width: 320,
            font: 'sinko',
            
        }),
        pos(350, 136),
        area(),
        layer('prompt')
    ]))

    let yes = add([
        text(`Yes`, {
            size: 30,
            font: 'sinko',
            
        }),
        pos(350, 435),
        area(),
        color(0, 255, 0),
        layer('prompt')
    ]);

    yes.onClick(() => {
        buy.callback();
        for (let thing of buyPromptStuff) {
            thing.destroy();
        }
    });

    let no = add([
        text(`No`, {
            size: 30,
            font: 'sinko',
            
        }),
        pos(601, 435),
        area(),
        color(255, 0, 0),
        layer('prompt')
    ]);

    no.onClick(() => {
        for (let thing of buyPromptStuff) {
            thing.destroy();
        }
    });

    buyPromptStuff.push(yes);
    buyPromptStuff.push(no);
}

var buy = add([
    sprite('buy'),
    pos(286, 88), 
    area(),
    scale(2),
    origin("center")
]);

buy.cost = 200;
buy.callback = addEnergyHarvester;
buy.string = 'Energy Harvestor'

buy.onClick(() => {
    promptBuy();
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
    buy.pos = vec2(608, 88);
    buy.callback = addTransportProtein;
    buy.cost = 200;
    buy.string = 'Mitochondria Transport Protein';
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

    console.log(buy.pos)
    buy.pos = vec2(827, 288);
    buy.callback = addAcetylCoaMachine;
    buy.cost = 200;
    buy.string = 'Acetyl-CoA machine';
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

    console.log(buy.pos)
    buy.pos = vec2(827, 401);
    buy.callback = addCitricAcidCycle;
    buy.cost = 500;
    buy.string = 'Citric Acid Cycle';
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
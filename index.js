// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if(array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

kaboom({
    width: 1000,
    height: 600
});

const MOLECULE_SPEED = 60;
const ANIM_SPEED = 30;

var lastGlucoseSpawn = 0;
var lastATPSpawn = 15;
var molecules = [];
var displayMolecules = [];

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

loadSprite('citricAcidMaker', 'images/citric-acid-maker.png');
loadSprite('5cMaker', 'images/5c-maker.png');
loadSprite('4cMaker', 'images/4c-maker.png');
loadSprite('OaaMaker', 'images/oaa-maker.png');

layers(['game', 'pro', 'molecule', 'prompt'])

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
    origin("center"),
]);
 
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
    
    citricAcidMaker = add([
        sprite('citricAcidMaker'),
        pos(815, 404), 
        area(),
        scale(2),
        origin("center"),
        layer('pro')
    ]);

    fiveCMaker = add([
        sprite('5cMaker'),
        pos(815, 404), 
        area(),
        scale(2),
        origin("center"),
        layer('pro')
    ]);

    fourCMaker = add([
        sprite('4cMaker'),
        pos(815, 404), 
        area(),
        scale(2),
        origin("center"),
        layer('pro')
    ]);

    OaaMaker = add([
        sprite('OaaMaker'),
        pos(815, 404), 
        area(),
        scale(2),
        origin("center"),
        layer('pro')
    ]);
}

const adp1 = add([
    sprite('adp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin("center"),
    layer('molecule')
])

const adp2 = add([
    sprite('adp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
])

const atp1 = add([
    sprite('atp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
])

const atp2 = add([
    sprite('atp'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
])

const sixC = add([
    sprite('6c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
])

const threeC1 = add([
    sprite('3c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
])

const threeC2 = add([
    sprite('3c'),
    pos(120, 80), 
    area(),
    scale(2),
    origin('center'),
    layer('molecule')
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
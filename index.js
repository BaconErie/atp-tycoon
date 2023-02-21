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

/******************************
MAIN STUFF
*******************************/
var machines = [];
var molecules = [];

class Machine {
    constructor(name, position, reactantSlots, productSlots, entrancePos, centerPos, exitPos, productPath) {
        /* reactantSlots: [{
            name: String reactant name,
            pos: Vec2,
            sprite: Sprite
        }] */

        this.name = name;
        this.sprite = add([
            sprite(name),
            pos(position),
            area(),
            scale(2),
            origin('center')
        ])

        this.queue = []; // String of sprite names
        this.reactantSlots = reactantSlots;
        this.productSlots = productSlots;
        this.entrancePos = entrancePos;
        this.centerPos = centerPos;
        this.exitPos = exitPos;
        this.productPath = productPath; // The path products take when they leave the machine
        this.state = 'waiting'; // 'waiting'
    }

    inputMolecule(moleculeSprite) {
        let isReactant = false;
        
        for (let slot of this.reactantSlots) {
            if (moleculeSprite.name == slot['name']) {
                isReactant = true;
                break;
            }
        }

        if (isReactant) {
            this.queue.push(moleculeSprite.name)
            molecules.splice(molecules.indexOf(moleculeSprite), 1);
            moleculeSprite.remove(); 
        } else {
            moleculeSprite.moveTo(this.exitPos);
            moleculeSprite.path = this.productPath;
        }
    }

    run() {
        // Does the animations and like idk

        if (this.state == 'waiting') {
            // waiting for reactants

            // Look for blank slots and then fill in those blank slots
            for (let slot of this.reactantSlots) {
                if (slot.sprite == null) {


                    // We have a blank slot, look for something in the queue that can fill in that blank slot
                    for (let moleculeName of queue) {
                        if (moleculeName == slot.name) {
                            // Make a Molecule based on the name and pos
                            let molecule = new Molecule(slot.name, slot.pos, this.centerPos);
                            slot.sprite = molecule;
                            break;
                        }
                    }


                }
            }


            // Check if all the slots are full
            let allSlotsFull = true;
            for (let slot of this.reactantSlots) {
                if (slot.sprite == null) {
                    allSlotsFull = false;
                    break;
                }
            }

            if (allSlotsFull) {
                this.state = 'reacting';
            }
        }

        else if (this.state == 'reacting') {

        }
    }
}

class Molecule {
    constructor (name, startPos, path) {
        this.name = name;
        this._path = path; /* PATH CAN BE A LIST OF VEC 2, SINGLE VEC 2, OR NULL */

        this.sprite = add([
            sprite(name),
            pos(startPos), 
            area(),
            scale(2),
            origin("center")
        ])

        if (Array.isArray(this._path)) {
            if (this._path.length == 1 && this._path[0] == this.sprite.pos) {
                this.atDestination = true;
            } else {
                this.atDestination = false;
            }
        } else if (this._path == this.sprite.pos) {
            this.atDestination = true;
        } else {
            this.atDestination = false;
        }
    }

    remove() {
        destroy(this.sprite);
    }

    set path(newPath) {
        this._path = newPath

        if (Array.isArray(this._path)) {
            if (this._path.length == 1 && this._path[0] == this.sprite.pos) {
                this.atDestination = true;
            } else {
                this.atDestination = false;
            }
        } else if (this._path == this.sprite.pos) {
            this.atDestination = true;
        } else {
            this.atDestination = false;
        }
    }

    get path() {
        return this._path;
    }
}

var phosphorylation = add([
    sprite('phosphorylation'),
    pos(105, 78), 
    area(),
    scale(2),
    origin("center"),
]);
 
phosphorylation.queue = [];
phosphorylation.working = [];
phosphorylation.needed = {
    'glucose': 1,
    'atp': 2
}
phosphorylation.finishedItems = [];



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

function createAtp(pos_set, path, destination) {
    const atp = add([
        sprite('atp'),
        pos(pos_set), 
        area(),
        scale(2),
        origin('center')
    ])
    atp.type = 'atp';
    atp.path = path;
    atp.destination = destination;
    atp.moveTo(path[0].x, path[0].y, MOLECULE_SPEED);

    molecules.push(atp);

    return atp;
}

function displayAtp(pos_set) {
    const atp = add([
        sprite('atp'),
        pos(pos_set), 
        area(),
        scale(2),
        origin('center'),
        layer('pro')
    ])

    atp.final = pos_set;

    displayMolecules.push(atp);

    return atp;
}

function createGlucose(pos_set, path, destination) {
    const glucose = add([
        sprite('glucose'),
        pos(pos_set), 
        area(),
        scale(2),
        origin('center')
    ])
    glucose.type = 'glucose';
    glucose.path = path;
    glucose.destination = destination;
    glucose.moveTo(path[0].x, path[0].y, MOLECULE_SPEED);

    molecules.push(glucose);

    return glucose;
}

function displayGlucose(pos_set) {
    console.log('where')
    const glucose = add([
        sprite('glucose'),
        pos(pos_set), 
        area(),
        scale(2),
        origin('center'),
        layer('pro')
    ])

    glucose.final = pos_set;

    displayMolecules.push(glucose);

    return glucose;
}

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
    for (let molecule of displayMolecules) {
        molecule.moveTo(molecule.final, ANIM_SPEED);
    }

    for (let sprite of get()) {
        if (sprite.isClicked()) {
            clicked = sprite
            console.log(sprite.pos)
        }
    }

    if (lastGlucoseSpawn <= 0) {
        createGlucose(vec2(14, 82), [vec2(44, 82)], phosphorylation);
        lastGlucoseSpawn = 60;
    } else {
        lastGlucoseSpawn--;
    }

    if (lastATPSpawn <= 0) {
        createAtp(vec2(14, 82), [vec2(44, 82)], phosphorylation);
        lastATPSpawn = 30;
    } else {
        lastATPSpawn--;
    }

    for (const molecule of molecules) {
        molecule.moveTo(molecule.path[0], MOLECULE_SPEED)

        if (molecule.pos.x == molecule.path[0].x && molecule.pos.y == molecule.path[0].y) {
            molecule.path.shift();

            // Check if the molecule path has ended
            if (molecule.path.length == 0) {
                molecule.destination.queue.push(molecule.type);
                
                const index = molecules.indexOf(molecule);
                if (index > -1) { // only splice array when item is found
                    molecules.splice(index, 1); // 2nd parameter means remove one item only
                }

                destroy(molecule);
            } else {
                molecule.moveTo(molecule.path[0].x, molecule.path[0].y, MOLECULE_SPEED);
            }
        } 
    }

    for (let molecule of phosphorylation.queue) {
        if (molecule == 'glucose' && phosphorylation.needed['glucose'] != 0) {
            phosphorylation.needed['glucose']--;
            phosphorylation.queue.splice(molecules.indexOf(molecule), 1);

            // POSITION IT DEPEND ON HOW MANY IS IN WORKING
            var moleculeSprite;
            switch(phosphorylation.working.length) {
                case 0:
                    moleculeSprite = displayGlucose(vec2(85, 65));
                    break;
                
                case 1:
                    moleculeSprite = displayGlucose(vec2(85, 110));
                    break;

                case 2:
                    moleculeSprite = displayGlucose(vec2(124, 88));
                    break;
            }

            // ADD IT TO WORKING SO WE CAN MOVE IT
            phosphorylation.working.push(moleculeSprite);
        }

        else if (molecule == 'atp' && phosphorylation.needed['atp'] != 0) {
            phosphorylation.needed['atp']--;
            phosphorylation.queue.splice(molecules.indexOf(molecule), 1);

            // POSITION IT DEPEND ON HOW MANY IS IN WORKING
            var moleculeSprite;
            switch(phosphorylation.working.length) {
                case 0:
                    moleculeSprite = displayAtp(vec2(85, 65));
                    break;
                
                case 1:
                    moleculeSprite = displayAtp(vec2(85, 110));
                    break;

                case 2:
                    moleculeSprite = displayAtp(vec2(124, 88));
                    break;
            }

            // ADD IT TO WORKING SO WE CAN MOVE IT
            phosphorylation.working.push(moleculeSprite);
        }
    }

    if (phosphorylation.working.length == 3) {
        for (let molecule of phosphorylation.working) {
            molecule.final = vec2(109, 82)
            molecule.moved = true;
        }
    }

    for (let molecule of phosphorylation.working) {
        if (molecule.moved && molecule.pos.x == molecule.final.x && molecule.pos.y == molecule.final.y && !phosphorylation.finishedItems.includes(molecule._id)) {
            phosphorylation.finishedItems.push(molecule._id);
        }
    }

    let workingIds = []
    for (let molecule of phosphorylation.working) {
        workingIds.push(molecule._id);
    }

    console.log(workingIds.sort() == phosphorylation.finishedItems.sort())
    console.log(workingIds.sort())
    console.log(phosphorylation.finishedItems.sort())
    if (workingIds.equals(phosphorylation.working)) {
        console.log('yo termino')
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
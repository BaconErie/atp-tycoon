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

layers(['machine', 'molecule', 'game', 'prompt'])

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
var moleculesOnConveyor = [];

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
            origin('center'),
            layer('machine')
        ])

        this.queue = []; // String of sprite names
        this.reactantSlots = reactantSlots;
        this.productSlots = productSlots;
        this.entrancePos = entrancePos;
        this.centerPos = centerPos;
        this.exitPos = exitPos;
        this.productPath = productPath; // The path products take when they leave the machine. A dict, with name: path list
        this.state = 'waiting'; // 'waiting'
        this.lastExpel = 30;
    }

    inputMolecule(molecule) {
        let isReactant = false;
        
        for (let slot of this.reactantSlots) {
            if (molecule.name == slot['name']) {
                isReactant = true;
                break;
            }
        }

        if (isReactant) {
            this.queue.push(molecule.name)
            moleculesOnConveyor.splice(moleculesOnConveyor.indexOf(molecule), 1);
            molecule.remove(); 
        } else {
            molecule.sprite.moveTo(this.exitPos);
            molecule.path = this.productPath[molecule.name];
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
                    for (let moleculeName of this.queue) {
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
            let reactants = [];

            for (let slot of this.reactantSlots) {
                reactants.push(slot.sprite);
            }

            // Set the paths to the center of the machine
            for (let reactant of reactants) {
                reactant.path = this.centerPos;
            }

            // Move the reactants
            for (let reactant of reactants) {
                reactant.move();
            }

            // Check if all of the reactants are atDestination
            let allReactantsAtDest = true;
            for (let reactant of reactants) {
                if (!reactant.atDestination) {
                    allReactantsAtDest = false;
                    break;
                }
            }

            if (allReactantsAtDest) {
                // Remove all reactants
                for (let slot of this.reactantSlots) {
                    slot.sprite.remove();
                    slot.sprite = null;
                }

                // Create products
                for (let slot of this.productSlots) {
                    slot.sprite = new Molecule(slot.name, this.centerPos, slot.pos);
                }

                this.state = 'producting';
            }            
        }

        else if (this.state == 'producting') {
            let products = [];

            for (let slot of this.productSlots) {
                products.push(slot.sprite);
            }

            // Move the products
            for (let product of products) {
                product.move();
            }

            // Check if all the products are atDestination
            let allProductsAtDest = true;
            for (let product of products) {
                if (!product.atDestination) {
                    allProductsAtDest = false;
                    break;
                }
            }

            if (allProductsAtDest) {
                this.state = 'expelling';
            }
        }

        else if (this.state == 'expelling') {
            if (this.lastExpel <= 0) {
                let moleculeToExpel;

                for (let slot of this.productSlots) {
                    if (slot.sprite != null) {
                        moleculeToExpel = slot.sprite;
                        slot.sprite = null;
                        break;
                    }
                }

                // Expell molecule
                moleculeToExpel.path = this.productPath[moleculeToExpel.name];
                moleculeToExpel.sprite.moveTo(this.exitPos);
                moleculesOnConveyor.push(moleculeToExpel);

                this.lastExpel = 30;

                // If all molecules expelled, go back to waiting state

                let allMoleculesExpelled = true;
                for (let slot of this.productSlots) {
                    if (slot.sprite != null) {
                        allMoleculesExpelled = false;
                        break;
                    }
                }

                if (allMoleculesExpelled) {
                    this.state = 'waiting'
                }
            } else {
                this.lastExpel--;
            }
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
            origin("center"),
            layer('molecule')
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
            if (this._path.length == 1 && this._path[0].x == this.sprite.pos.x && this._path[0].y == this.sprite.pos.y) {
                this.atDestination = true;
            } else {
                this.atDestination = false;
            }
        
        
        } else if (this._path.x == this.sprite.pos.x && this._path.y == this.sprite.pos.y) {
            this.atDestination = true;
        } else {
            this.atDestination = false;
        }
    }

    get path() {
        return this._path;
    }

    move() {
        if (Array.isArray(this._path)) {
            this.sprite.moveTo(this._path[0], MOLECULE_SPEED);
        } else {
            this.sprite.moveTo(this._path, MOLECULE_SPEED);
        }

        if (Array.isArray(this._path)) {
            if (this._path.length == 1 && this._path[0].x == this.sprite.pos.x && this._path[0].y == this.sprite.pos.y) {
                this.atDestination = true;
            } else {
                this.atDestination = false;
            }
        } else if (this._path.x == this.sprite.pos.x && this._path.y == this.sprite.pos.y) {
            this.atDestination = true;
        } else {
            this.atDestination = false;
        }
    }
}

var phosphorylationMachine = new Machine(
    'phosphorylation',
    vec2(105, 78),
    [
        {
            'name': 'atp',
            'pos': vec2(86, 63),
            'sprite': null
        },

        {
            'name': 'atp',
            'pos': vec2(86, 105),
            'sprite': null
        },

        {
            'name': 'glucose',
            'pos': vec2(127, 85),
            'sprite': null
        },

    ],
    [
        {
            'name': 'adp',
            'pos': vec2(86, 63),
            'sprite': null
        },

        {
            'name': 'adp',
            'pos': vec2(86, 105),
            'sprite': null
        },

        {
            'name': '3c',
            'pos': vec2(127, 63),
            'sprite': null
        },

        {
            'name': '3c',
            'pos': vec2(127, 105),
            'sprite': null
        },
    ],
    vec2(61, 85),
    vec2(110, 83),
    vec2(148, 85),
    {
        '3c': vec2(213, 85),
        'adp': vec2(213, 85)
    }
    )

machines.push(phosphorylationMachine);

var energyHarvester = null;

function addEnergyHarvester() {
    energyHarvester = add([
        sprite('energy_harvester'),
        pos(356, 70), 
        area(),
        scale(2),
        origin("center")
    ]);

    energyHarvester = new Machine(
    'energy_harvester',
    vec2(356, 70),
    [
        {
            'name': 'nad+',
            'pos': vec2(86, 63),
            'sprite': null
        },

        {
            'name': 'nadh',
            'pos': vec2(86, 105),
            'sprite': null
        },

        {
            'name': 'adp',
            'pos': vec2(127, 85),
            'sprite': null
        },

    ],
    )

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
    for (let sprite of get()) {
        if (sprite.isClicked()) {
            clicked = sprite
            console.log(sprite.pos)
        }
    }

    if (lastGlucoseSpawn <= 0) {
        let newGlucose = new Molecule('glucose', vec2(0, 85), vec2(61, 85));
        moleculesOnConveyor.push(newGlucose);
        lastGlucoseSpawn = 60;
    } else {
        lastGlucoseSpawn--;
    }

    if (lastATPSpawn <= 0) {
        let newATP = new Molecule('atp', vec2(0, 85), vec2(61, 85));
        moleculesOnConveyor.push(newATP);
        lastATPSpawn = 30;
    } else {
        lastATPSpawn--;
    }

    for (let molecule of moleculesOnConveyor) {
        molecule.move();

        // See if any of the molecules are at the start pos of any of the machines
        for (let machine of machines) {
            if (molecule.sprite.pos.x == machine.entrancePos.x && molecule.sprite.pos.y == machine.entrancePos.y) {
                machine.inputMolecule(molecule);
            }
        }
    }
    
    // Run the machines
    for (let machine of machines) {
        machine.run();
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
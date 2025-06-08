const fs = require('fs');
const graphology = require('graphology');
const gShortestPath = require('graphology-shortest-path');

const graphData = require('../logic_graph.json');
if (!graphData) {
    console.warn('[WARN] No logic graph found, has it not been generated yet?');
    return 0;
}

const graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
graph.import(graphData);

const locationNames = fs.readdirSync('./randomiser/game_logic/locations_detailed').map((file) => {
    return file.split('.')[0];
});


function validateConnected() {
    let paths = gShortestPath.singleSource(graph, "9:4");
    let connectedNodes = Object.keys(paths);

    console.log(`[INFO] >> connected nodes: ${connectedNodes.length}/${graph.order}`);

    let disconnectedNodes = graph.nodes().filter((node) => !connectedNodes.includes(node));
    if (disconnectedNodes.length > 0) {
        console.error('[ERROR] The logic graph contains disconnected nodes:', disconnectedNodes);
        return false;
    }
    return true;
}

function validateComplete() {
    let missing = [];
    locationNames.forEach((name) => {
        if (!graph.someNode((_, attr) => attr.location == name)) {
            missing.push(name);
        }
    });

    if (missing.length > 0) {
        console.error('[ERROR] Not all locations have been loaded:', missing);
        return false;
    }
    console.log('[INFO] >> all locations have been loaded');
    return true;
}

function validateSourceNodes() {
    let sources = [];
    graph.nodes().forEach((node) => {
        let degree = graph.inDegree(node);
        if (degree == 0 && node != '9:4') sources.push(node);
    });

    if (sources.length > 0) {
        console.error('[ERROR] There are invalid source nodes:', sources);
        return false;
    }
    console.log('[INFO] >> no invalid source nodes');
    return true;
}

function validateSinkNodes() {
    let sinks = [];
    graph.nodes().forEach((node) => {
        let degree = graph.outDegree(node);
        if (degree == 0 && graph.getNodeAttribute(node, 'type') == 'entrance') sinks.push(node);
        if (degree > 0 && graph.getNodeAttribute(node, 'type') != 'entrance') sinks.push(node);
    });

    if (sinks.length > 0) {
        console.error('[ERROR] There are invalid sink nodes:', sinks);
        return false;
    }

    console.log('[INFO] >> no invalid sink nodes');
    return true;
}

function validateAgainstRom() {
    let romFile = "./randomiser/rom/gs2.gba";
    fs.access(romFile, fs.constants.F_OK, (err) => {
        if (err) {
            console.warn('[WARN] ROM does not exist, skipping validating against it.');
            return true
        }
    });

    let mersenne = require('../modules/mersenne.js');
    let prng = mersenne(1);

    let vanillaRom = new Uint8Array(fs.readFileSync(romFile));
    let rom = Uint8Array.from(vanillaRom);
    let mapCode = require('../randomiser/game_logic/map_code.js');
    mapCode.initialise(rom);
    let doors = require('../randomiser/game_data/doors.js');
    doors.initialise(mapCode.clone());

    const { DoorRandomiser } = require('../randomiser/game_logic/randomisers/door_randomiser.js');
    randomiser = new DoorRandomiser(prng, {});
    var exitData = doors.clone()
    var newExitData = randomiser.applyToExits(exitData);

    let badExits = [];

    newExitData.forEach((exit) => {
        if (((exit.vanillaDestMap !== undefined) && (exit.vanillaDestMap != exit.destMap || exit.vanillaDestEntrance != exit.destEntrance)) || (exit.vanillaCondition != "0xFFFFFFFF" && (exit.vanillaCondition != exit.condition))) {
            badExits.push(exit)
        }
    })

    if (badExits.length > 0) {
        let bad = badExits.map((exit) => `${exit.mapId}:${exit.eventId} !-> ${exit.vanillaDestMap}:${exit.vanillaDestEntrance}: ${(exit.addr + 0x8000).toString(16)}`)
        console.error('[ERROR] Bad exits found: ');
        bad = bad.filter(function (item, pos) {
            if (bad.indexOf(item) == pos) {
                console.log(item)
            }
        })

        return false
    }

    return true
}

let valid = true;

console.log('[INFO] Starting graph validation...');
if (!validateConnected()) valid = false;
if (!validateComplete()) valid = false;
if (!validateSourceNodes()) valid = false;
if (!validateSinkNodes()) valid = false;
if (!validateAgainstRom()) valid = false;

if (!valid) {
    console.error('[ERROR] Graph validation failed! One or more tests did not pass!\n');
} else {
    console.log('[INFO] All tests passed!\n');
}
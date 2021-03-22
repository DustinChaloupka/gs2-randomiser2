const fs = require('fs');

const textStart = 2915;
const textEnd = 3158;
const addrOffset = 0xC15F4;
const addrInterval = 0x348;

const weightFallout = 0.33;
const psyDecayChance = 0.15;

const utilPsynergy = [12, 24, 33, 78, 185];
var psynergyGroups;

var classData = [];

function loadClassData(rom, id, classes) {
    var addr = addrOffset + (id * addrInterval);
    if (classes[0] == "NPC") {
        classes = classes.slice(1);
        addr += 0x54;
    }

    var elements = [];
    var stats = [];
    var psynergy = [];
    var levels = [];

    for (var i = 0; i < classes.length; ++i) {
        var cAddr = addr + (i * 0x54);
        elements.push([rom[cAddr + 4], rom[cAddr + 5], rom[cAddr + 6], rom[cAddr + 7]]);
        stats.push([rom[cAddr + 8], rom[cAddr + 9], rom[cAddr + 10], rom[cAddr + 11], rom[cAddr + 12], rom[cAddr + 13]]);
        psynergy.push([]);
        levels.push([]);

        for (var j = 0; j < 16; ++j) {
            psynergy[i].push(rom[cAddr + (4 * j) + 16] + (rom[cAddr + (4 * j) + 17] << 8));
            levels[i].push(rom[cAddr + (4 * j) + 18]);
        }
    }

    classData.push({ id: id, classes: classes, addr: addr, elements: elements, 
        stats: stats, psynergy: psynergy, levels: levels });
}

function clone() {
    return JSON.parse(JSON.stringify(classData));
}

function initialise(rom, textutil) {
    var id = 0;
    var line = textStart;
    while (line <= textEnd) {
        var classLine = [];
        for (var i = 0; i < 10 && line <= textEnd; ++i) {
            var name = textutil.readLinePretty(line++);
            if (name != "?") classLine.push(name);
        }
        loadClassData(rom, id++, classLine);
    }

    psynergyGroups = require('./psynergyLines.json');
}

function writeToRom(instance, rom) {
    instance.forEach((classLine) => {
        for (var i = 0; i < classLine.classes.length; ++i) {
            var cAddr = classLine.addr + (i * 0x54);
            rom.set(classLine.elements[i], cAddr + 4);
            rom.set(classLine.stats[i], cAddr + 8);

            var psynergy = classLine.psynergy[i];
            var levels = classLine.levels[i];
            for (var j = 0; j < 16; ++j) {
                rom[cAddr + (4 * j) + 16] = (psynergy[j] & 0xFF);
                rom[cAddr + (4 * j) + 17] = (psynergy[j] >> 8);
                rom[cAddr + (4 * j) + 18] = levels[j];
            }
        }
    });
}

function clearPsynergyData(classLine) {
    for (var i = 0; i < classLine.classes.length; ++i) {
        classLine.psynergy[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        classLine.levels[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

function insertPsynergyGroup(prng, classLine, index, psynergy, levels, decay) {
    for (var i = classLine.classes.length - 1; i >= 0; --i) {
        for (var j = 0; j < psynergy.length; ++j) {
            classLine.psynergy[i][index + j] = psynergy[j];
            classLine.levels[i][index + j] = levels[j];
        }
        if (decay && prng.random() <= psyDecayChance)
            break;
    }
}

function insertPsynergySequence(prng, classLine, index, psynergy, level) {
    var seqStep = psynergy.length - 1;
    for (var i = classLine.classes.length - 1; i >= 0; --i) {
        classLine.psynergy[i][index] = psynergy[seqStep];
        classLine.levels[i][index] = level;
        if (i == 0) continue;

        var decayChance = seqStep / i;
        if (prng.random() <= decayChance) --seqStep;
    }
}

function shufflePsynergyByClass(instance, prng) {
    var psynergyPool = [];
    var levelPool = [];
    instance.forEach((classLine) => {
        psynergyPool.push(classLine.psynergy.slice());
        levelPool.push(classLine.levels.slice());
    });

    instance.forEach((classLine) => {
        var rand = Math.floor(prng.random() * psynergyPool.length);
        var targetPsynergy = psynergyPool.splice(rand, 1)[0];
        var targetLevels = levelPool.splice(rand, 1)[0];

        var sourceLength = classLine.psynergy.length;
        var targetLength = targetPsynergy.length;

        if (sourceLength == targetLength) {
            classLine.psynergy = targetPsynergy;
            classLine.levels = targetLevels;
        } else {
            var frac = targetLength / sourceLength;
            if (sourceLength < targetLength) {
                for (var i = 0; i < sourceLength; ++i) {
                    classLine.psynergy[i] = targetPsynergy[Math.ceil(frac * i)];
                    classLine.levels[i] = targetLevels[Math.ceil(frac * i)];
                }
            } else {
                for (var i = 0; i < sourceLength; ++i) {
                    classLine.psynergy[i] = targetPsynergy[Math.floor(frac * i)];
                    classLine.levels[i] = targetLevels[Math.floor(frac * i)];
                }
            }
        }
    });
}

function shufflePsynergyByGroup(instance, prng) {
    var weights = [];
    var totalWeight = 0;
    psynergyGroups.forEach(() => {
        weights.push(1);
        ++totalWeight;
    });

    instance.forEach((classLine) => {
        var selectedGroups = [];
        var psyNum = 0;
        while (true) {
            var selectedGroup;
            while (selectedGroup == undefined || selectedGroups.includes(selectedGroup)) {
                var rand = prng.random() * totalWeight;
                for (var i = 0; i < psynergyGroups.length && rand > 0; ++i) {
                    selectedGroup = i;
                    rand -= weights[i];
                }
            }

            var group = psynergyGroups[selectedGroup];
            psyNum += (group.type == "sequence") ? 1 : group.psy.length;
            if (psyNum > 16) break;

            var oldWeight = weights[selectedGroup];
            weights[selectedGroup] *= weightFallout;
            totalWeight -= (oldWeight - weights[selectedGroup]);

            selectedGroups.push(selectedGroup);
        }

        psyNum = 0;
        clearPsynergyData(classLine);
        selectedGroups.forEach((index) => {
            var group = psynergyGroups[index];
            var levels = group.levels[Math.floor(prng.random() * group.levels.length)];;

            if (group.type == "sequence") {
                insertPsynergySequence(prng, classLine, psyNum, group.psy, levels);
                ++psyNum;
            } else {
                insertPsynergyGroup(prng, classLine, psyNum, group.psy, levels, psyNum >= 8);
                psyNum += group.psy.length;
            }
        });
    });
}

function shufflePsynergyByElement(instance, prng) {

}

function shufflePsynergy(instance, prng) {

}

function randomisePsynergy(instance, mode, prng) {
    switch(mode) {
        case 1: return shufflePsynergyByClass(instance, prng);
        case 2: return shufflePsynergyByGroup(instance, prng);
        case 3: return shufflePsynergyByElement(instance, prng);
        case 4: return shufflePsynergy(instance, prng);
    }
}

function randomiseLevels(instance, mode) {
    if (mode == 0) return;
}

function removeUtilityPsynergy(instance) {
    instance.forEach((classLine) => {
        for (var i = 0; i < classLine.classes.length; ++i) {
            var psynergy = classLine.psynergy[i];
            var levels = classLine.levels[i];
            for (var j = 0; j < 16; ++j) {
                if (utilPsynergy.includes(psynergy[j])) {
                    psynergy[j] = 0;
                    levels[j] = 0;
                }
            }
        }
    });
}

module.exports = {initialise, writeToRom, clone, removeUtilityPsynergy, randomisePsynergy, randomiseLevels};
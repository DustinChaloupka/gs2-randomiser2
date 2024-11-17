const { writeArray, write32b } = require('../../../util/binary.js');
const textutil = require('../../game_logic/textutil.js');

function apply(rom, settings, text) {
    // Add an icon mapping for the multiworld pseudo-item
    writeArray(rom, 0x0100311C + (settings['shuffle-characters'] ? 0x20 : 0x0), [0x0, 0xA, 0xC, 0x1]);

    // Add a custom function for picking up multiworld pseudo-items
    writeArray(rom, 0x10061F0, [0x0, 0xB5, 0x4, 0x20, 0x1, 0x21, 0x0, 0xF0, 0x6, 0xF8, 0xB5, 0x20, 0x40, 0x1, 0x0, 0x21, 0x0, 0xF0, 0x5, 0xF8, 0x0, 0xBD, 
        0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0xD1, 0xCC, 0x3, 0x8, 0x0, 0x4C, 0x20, 0x47, 0x41, 0x80, 0x3, 0x8]);

    textutil.writeLine(text, 5792, '\x12\x01 found an\x03Archipelago token!\x01The token disappears...\x02');

    // Add a custom function for receiving items from the multiworld
    writeArray(rom, 0x1006300, [0x1, 0xB5, 0x0, 0xF0, 0x2D, 0xF8, 0x1, 0xBC, 0x0, 0xF0, 0x2, 0xF8, 0x0, 0xBD, 0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0x65, 0x70, 
        0x2, 0x8, 0x1, 0xB5, 0x0, 0xF0, 0x21, 0xF8, 0x1, 0xBC, 0x0, 0xF0, 0x2, 0xF8, 0x0, 0xBD, 0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0xB1, 0x79, 0x2, 0x8, 0x1, 
        0xB5, 0x0, 0xF0, 0x15, 0xF8, 0x1, 0xBC, 0x0, 0xF0, 0x2, 0xF8, 0x0, 0xBD, 0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0x21, 0x7E, 0x2, 0x8, 0x1, 0xB5, 0x0, 
        0xF0, 0x9, 0xF8, 0x1, 0xBC, 0x0, 0xF0, 0x2, 0xF8, 0x0, 0xBD, 0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0x35, 0x85, 0x2, 0x8, 0x20, 0xB5, 0x37, 0x49, 0x8, 
        0x88, 0x0, 0x28, 0x40, 0xD0, 0x5, 0x0, 0x0, 0xF0, 0x40, 0xF8, 0x0, 0xF0, 0x52, 0xF8, 0x0, 0xF0, 0x54, 0xF8, 0xE, 0x20, 0x0, 0x2, 0x38, 0x30, 0x0, 
        0x21, 0x0, 0xF0, 0x42, 0xF8, 0x80, 0x21, 0x9, 0x2, 0x28, 0x0, 0x8, 0x40, 0x0, 0x28, 0x10, 0xD0, 0x6D, 0x1A, 0x53, 0x20, 0x0, 0xF0, 0x34, 0xF8, 0x28, 
        0x0, 0x0, 0xF0, 0x4D, 0xF8, 0x28, 0x0, 0x5, 0x21, 0x0, 0xF0, 0x45, 0xF8, 0xE1, 0x20, 0x0, 0x1, 0x0, 0x21, 0x0, 0xF0, 0x2C, 0xF8, 0xE, 0xE0, 0x28, 
        0x0, 0xFF, 0xF7, 0x24, 0xFE, 0x1, 0x28, 0x9, 0xD0, 0x53, 0x20, 0x0, 0xF0, 0x1F, 0xF8, 0xF9, 0xF7, 0x20, 0xFF, 0x0, 0x28, 0x2, 0xDA, 0x28, 0x0, 0x0, 
        0xF0, 0x20, 0xF8, 0x1C, 0x49, 0x8, 0x78, 0x1, 0x30, 0x8, 0x70, 0x0, 0x20, 0x48, 0x70, 0x18, 0x49, 0x8, 0x80, 0x0, 0xF0, 0xA, 0xF8, 0x0, 0xF0, 0x18, 
        0xF8, 0x0, 0xF0, 0x1E, 0xF8, 0x20, 0xBD, 0x0, 0x0, 0x0, 0x4C, 0x20, 0x47, 0xA9, 0x22, 0xD, 0x8, 0x0, 0x4C, 0x20, 0x47, 0x51, 0x23, 0xD, 0x8, 0x0, 
        0x4C, 0x20, 0x47, 0xB1, 0xC, 0x1C, 0x8, 0x0, 0x4C, 0x20, 0x47, 0x41, 0x80, 0x3, 0x8, 0x0, 0x4C, 0x20, 0x47, 0xD, 0x26, 0xD, 0x8, 0x0, 0x4C, 0x20, 
        0x47, 0xE9, 0xB8, 0xC, 0x8, 0x0, 0x4C, 0x20, 0x47, 0xF9, 0x35, 0x2, 0x8, 0x0, 0x4C, 0x20, 0x47, 0x25, 0x35, 0x2, 0x8, 0x0, 0x4C, 0x20, 0x47, 0xD1, 
        0xCC, 0x3, 0x8, 0x0, 0x4C, 0x20, 0x47, 0xB1, 0xFE, 0xA, 0x8, 0x96, 0xA, 0x0, 0x2, 0x72, 0xA, 0x0, 0x2]);

    textutil.writeLine(text, 3640, 'An item appears\x03before you!\x02');

    // Redirect valid mainLoop scripts to the receiving function
    write32b(rom, 0x2F268, 0x09006300);
    //write32b(rom, 0x2F26C, 0x09006318);
    write32b(rom, 0x2F280, 0x09006330);
    //write32b(rom, 0x2F284, 0x09006348);
}

module.exports = {apply};
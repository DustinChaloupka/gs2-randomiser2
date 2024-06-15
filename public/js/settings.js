const randomiserSettings = {
    'class-stats': [0, 0, 1],
    'no-learning': [0, 1, 1],
    'show-items': [0, 2, 1],
    'gs1-items': [0, 3, 1],
    'omit': [0, 4, 2],
    'item-shuffle': [0, 6, 2, [10, 5, 1, 3]],

    'psynergy-power': [1, 0, 1],
    'equip-curse': [1, 1, 1],
    'equip-effect': [1, 2, 1],
    'equip-unleash': [1, 3, 1],
    'equip-sort': [1, 4, 1],
    'equip-stats': [1, 5, 1],
    'equip-cost': [1, 6, 1],
    'equip-shuffle': [1, 7, 1],

    'summon-sort': [2, 0, 1],
    'summon-power': [2, 1, 1],
    'summon-cost': [2, 2, 1],
    'djinn-scale': [2, 3, 1],
    'djinn-aoe': [2, 4, 1],
    'djinn-power': [2, 5, 1],
    'djinn-stats': [2, 6, 1],
    'djinn-shuffle': [2, 7, 1],

    'enemypsy-aoe': [3, 0, 1],
    'enemypsy-power': [3, 1, 1],
    'psynergy-aoe': [3, 2, 1],
    'psynergy-cost': [3, 3, 1],
    'char-element': [3, 4, 2],
    'char-stats': [3, 6, 2],

    'qol-fastship': [4, 0, 1],
    'qol-tickets': [4, 1, 1],
    'qol-cutscenes': [4, 2, 1],
    'class-levels': [4, 3, 2],
    'class-psynergy': [4, 5, 3],

    'free-retreat': [5, 0, 1],
    'free-avoid': [5, 1, 1],
    'boss-logic': [5, 2, 1],
    'skips-maze': [5, 3, 1],
    'skips-oob-easy': [5, 4, 1],
    'skips-basic': [5, 5, 1],
    'ship': [5, 6, 2],

    'start-reveal': [6, 0, 1],
    'start-revive': [6, 1, 1],
    'start-heal': [6, 2, 1],
    'qol-hints': [6, 3, 1],
    'equip-attack': [6, 4, 1],
    'skips-oob-hard': [6, 5, 1],
    'dummy-items': [6, 6, 1],
    'adv-equip': [6, 7, 1],

    'scale-coins': [7, 0, 4],
    'scale-exp': [7, 4, 4],

    'start-levels': [8, 0, 7],
    'equip-defense': [8, 7, 1],

    'patch-avoid': [9, 2, 1],
    'curse-disable': [9, 3, 1],
    'sanc-cost': [9, 4, 2],
    'enemy-eres': [9, 6, 2],

    'manual-rg': [10, 1, 1],
    'fixed-puzzles': [10, 2, 1],
    'random-puzzles': [10, 3, 1],
    'easy-boss': [10, 4, 1],
    'halve-enc': [10, 6, 1],
    'hard-mode': [10, 7, 1]
};

const randomiserPresets = [
    [102, 16, 137, 0, 7, 3, 14, 17, 5, 7, 16],
    [175, 156, 201, 80, 79, 3, 72, 17, 5, 7, 0],
    [159, 255, 239, 170, 151, 3, 72, 17, 5, 7, 0],
    [0, 0, 0, 0, 0, 0, 0, 17, 5, 0, 0],
    [159, 172, 200, 144, 79, 131, 200, 17, 18, 7, 0],
    [207, 255, 255, 175, 151, 142, 216, 17, 133, 135, 0],
    [159, 239, 222, 152, 143, 130, 88, 66, 146, 68, 18]
];
var presetData;
var presetToDelete;

function clamp(val, min, max) {
    return Math.max(Math.min(val, max), min);
}

function saveCachedSetting(elem) {
    localStorage.setItem(elem.id, elem.type == 'checkbox' ? elem.checked : elem.value);
}

function loadCachedSetting(elem) {
    var val = localStorage.getItem(elem.id);
    if (val == null) return;

    if (elem.type == "checkbox") {
        $(elem).prop('checked', (val == "true"));
    } else {
        $(elem).val(val);
    }
}

function parseSettingsString(str) {
    var array = new Uint8Array(randomiserSettingsLength);
    str = str.padEnd(array.length * 2, '0');

    for (var i = 0; i < array.length; ++i) {
        var byte = str.slice(i*2, i*2 + 2);
        array[i] = parseInt(byte, 16);
    }

    return array;
}

function applySettings(arr) {
    while (arr.length < randomiserSettingsLength) {
        arr.append(0);
    }

    Object.keys(randomiserSettings).forEach((key) => {
        let elem = $(`#inp-${key}`);
        if (!elem) {
            return;
        }

        let entry = randomiserSettings[key];
        let value = (arr[entry[0]] >> entry[1]) & ((1 << entry[2]) - 1);

        if (elem.hasClass('form-check-input')) {
            elem.prop('checked', (value > 0));
        } else {
            for (let i = 3; i < entry.length; ++i) {
                let fragment = entry[i];
                let fragValue = (arr[fragment[0]] >> fragment[1]) & ((1 << fragment[2]) - 1);
                value += (fragValue << fragment[3]);
            }
            elem.val(value);
        }
    });
}

function getSettingsArray() {
    var arr = new Uint8Array(randomiserSettingsLength).fill(0);
    Object.keys(randomiserSettings).forEach((key) => {
        let elem = $(`#inp-${key}`);
        if (!elem) {
            return;
        }

        let entry = randomiserSettings[key];
        if (elem.hasClass('form-check-input')) {
            if (elem.prop('checked')) {
                arr[entry[0]] |= (1 << entry[1]);
            }
        } else {
            let value = elem.val();
            arr[entry[0]] |= (value & ((1 << entry[2]) - 1)) << entry[1];
            for (let i = 3; i < entry.length; ++i) {
                let fragment = entry[i];
                arr[fragment[0]] |= ((value >> fragment[3]) & ((1 << fragment[2]) - 1)) << fragment[1];
            }
        }
    });
    return arr;
}

function getSettingsString() {
    var result = '';
    getSettingsArray().forEach((byte) => { result += byte.toString(16).padStart(2, '0'); });
    return result;
}

function randomiseSeed() {
    var seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    $("#inp-seed").val(seed);
}

function updatePreset(preset) {
    let version = preset.version ?? 0;
    if (version < 1) {
        let settings = parseSettingsString(preset.settings);
        preset.settings = preset.settings.substring(0, 24) + ((settings[0] & 4 != 0) ? '20' : '00');
    }
    preset.version = 1;
}

function getDefaultPresets() {
    return {
        "easy": {
            name: "Easy",
            desc: "Key Items and Djinn shuffled, starting with healing Psynergy and Revive.",
            settings: "6610890007030e110504104000",
            version: 1
        },
        "open_mode": {
            name: "Open Mode",
            desc: "Most items and Djinn shuffled with the Lemurian Ship unlocked from the start. Starting levels are increased to compensate.",
            settings: "9facc8904f83c8111204004020",
            version: 1
        },
        "example_race_preset": {
            name: "Example Race Preset",
            desc: "The original race preset. Check Discord for more up-to-date racing presets.",
            settings: "9fefde988f8258429244124020",
            version: 1
        }
    };
}

function makePresetId(name) {
    var baseId = name.toLowerCase().replaceAll(/\s+/g, '_').replaceAll(/[^a-z0-9_]+/g, '');
    var id = baseId;
    var discriminant = 0;

    while (id in presetData) {
        id = `${baseId}_${++discriminant}`;
    }
    return id;
}

function strToBase64(str) {
    var encoded = new TextEncoder().encode(str);
    var binary = Array.from(encoded, (chr) => String.fromCodePoint(chr)).join('');
    return btoa(binary);
}

function base64ToStr(b64) {
    var encoded = Uint8Array.from(atob(b64), (chr) => chr.codePointAt(0));
    return new TextDecoder().decode(encoded);
}

function validateSettings(settings) {
    var clean = settings.toLowerCase().replaceAll(/[^a-f0-9]/g, '');
    while (clean.length < randomiserSettingsLength * 2) {
        clean += '0';
    }
    return clean.substring(0, randomiserSettingsLength * 2);
}

$(document).ready(() => {
    presetData = localStorage.getItem("presets");
    if (!presetData) {
        presetData = getDefaultPresets();
        localStorage.setItem("presets", JSON.stringify(presetData));
    } else {
        presetData = JSON.parse(presetData);
        Object.keys(presetData).forEach((id) => updatePreset(presetData[id]));
        localStorage.setItem("presets", JSON.stringify(presetData));
    }

    const presetDropdown = $("#inp-preset");
    Object.keys(presetData).forEach((preset) => {
        presetDropdown.append($("<option>").text(presetData[preset].name).attr("value", preset));
    });

    randomiseSeed();
    $("#btn-seed").on('click', randomiseSeed);

    $("#inp-seed").on('change', () => {
        var seed = Number($("#inp-seed").val());
        if (seed == '' || isNaN(seed) || seed > Number.MAX_SAFE_INTEGER)
            randomiseSeed();
        else   
            $("#inp-seed").val(seed);
    });

    $("#btn-submit").on('click', () => {
        var seed = $("#inp-seed").val();
        window.location.href = `./randomise.html?settings=${getSettingsString()}&seed=${seed}`;
    });

    $("#btn-submit-race").on('click', () => {
        var seed = $("#inp-seed").val();
        window.location.href = `./randomise_race.html?settings=${getSettingsString()}&seed=${seed}`;
    });

    $("#inp-scale-exp").on('change', function () {
        $(this).val(clamp($(this).val(), 1, 15));
    });

    $("#inp-scale-coins").on('change', function () {
        $(this).val(clamp($(this).val(), 1, 15));
    });

    $("#inp-start-levels").on('change', function () {
        $(this).val(clamp($(this).val(), 5, 99));
    });

    $("#inp-preset").on('change', () => {
        var val = $("#inp-preset").val();
        if (val != '') {
            $("#p-preset").text(presetData[val].desc);
            $("#btn-preset, #btn-preset-export, #btn-preset-delete").prop("disabled", false);
        } else {
            $("#p-preset").text("");
            $("#btn-preset, #btn-preset-export, #btn-preset-delete").prop("disabled", true);
        }
    });

    $("#btn-preset").on('click', () => {
        var val = $("#inp-preset").val();
        if (val != '' && presetData[val] != undefined) {
            applySettings(parseSettingsString(presetData[val].settings));
            $(".cache-setting").each((_, elem) => saveCachedSetting(elem));
        }
    });

    $("#btn-preset-export").on('click', () => {
        var val = $("#inp-preset").val();
        if (val == '' || !presetData[val]) {
            return;
        }

        var preset = presetData[val];
        var presetStr = `${strToBase64(preset.name)};${strToBase64(preset.desc)};${preset.version};${preset.settings}`;

        $('#ro-preset-export').val(presetStr);
        bootstrap.Modal.getOrCreateInstance($('#modal-preset-export').get(0)).show();
    });

    $("#btn-preset-copy").on('click', async () => {
        await navigator.clipboard.writeText($('#ro-preset-export').val());
    });

    $("#btn-preset-delete").on('click', () => {
        var val = $("#inp-preset").val();
        if (val == '' || !presetData[val]) {
            return;
        }

        presetToDelete = val;
        $('#p-delete-name').text(presetData[val].name);
        bootstrap.Modal.getOrCreateInstance($('#modal-preset-delete').get(0)).show();
    });

    $("#btn-preset-delete-confirm").on('click', () => {
        delete presetData[presetToDelete];
        localStorage.setItem("presets", JSON.stringify(presetData));

        $("#inp-preset").val('').change().children(`option[value="${presetToDelete}"]`).remove();
        bootstrap.Modal.getInstance($('#modal-preset-delete').get(0)).hide();
    });

    $("#inp-preset-import").on('input', function() {
        $('#error-import, #div-import-info').addClass('d-none');
        let val = $(this).val();
        if (val == '') {
            return;
        }

        let fragments = val.split(';');
        if (fragments.length < 3) {
            $('#error-import').removeClass('d-none');
            return;
        }

        let name = base64ToStr(fragments[0]);
        let desc = base64ToStr(fragments[1]);
        let settings = validateSettings(fragments.length >= 4 ? fragments[3] : fragments[2]);

        if (desc.length > 1000 || settings == undefined) {
            $('#error-import').removeClass('d-none');
            return;
        }

        $('#div-import-info').removeClass('d-none');
        $('#p-import-name').text(name);
        $('#p-import-desc').text(desc);
    });

    $("#btn-preset-load-confirm").on('click', () => {
        let val = $('#inp-preset-import').val();
        if (val == '') {
            return;
        }

        let fragments = val.split(';');
        if (fragments.length < 3) {
            $('#error-import').removeClass('d-none');
            return;
        }

        let name = base64ToStr(fragments[0]);
        let desc = base64ToStr(fragments[1]);
        let version = Number(fragments.length >= 4 ? fragments[2] : 0);
        let settings = validateSettings(fragments.length >= 4 ? fragments[3] : fragments[2]);
        if (desc.length > 1000 || settings == undefined) {
            return;
        }

        let id = makePresetId(name);
        presetData[id] = { name, desc, settings, version };
        updatePreset(presetData[id]);
        localStorage.setItem("presets", JSON.stringify(presetData));

        presetDropdown.append($("<option>").text(name).attr("value", id));
        bootstrap.Modal.getInstance($('#modal-preset-import').get(0)).hide();
    });

    $("#btn-preset-save-confirm").on('click', () => {
        $('#error-save-desc, #error-save-name').addClass('d-none');
        let name = $('#inp-preset-save-name').removeClass('is-invalid').val();
        let desc = $('#inp-preset-save-desc').removeClass('is-invalid').val();
        if (!name || name == '') {
            $('#inp-preset-save-name').addClass('is-invalid');
            $('#error-save-name').removeClass('d-none');
            return;
        }
        if (desc.length > 1000) {
            $('#inp-preset-save-desc').addClass('is-invalid');
            $('#error-save-desc').removeClass('d-none');
            return;
        }

        let id = makePresetId(name);
        presetData[id] = { name, desc, settings: getSettingsString(), version: 1 };
        localStorage.setItem("presets", JSON.stringify(presetData));

        presetDropdown.append($("<option>").text(name).attr("value", id));
        bootstrap.Modal.getInstance($('#modal-preset-save').get(0)).hide();
    });

    var tooltipHolders = $(".tooltip-container");
    tooltipHolders.each((i) => new bootstrap.Tooltip(tooltipHolders[i]));

    $(".cache-setting").each((_, elem) => loadCachedSetting(elem))
        .on('change', (e) => saveCachedSetting(e.target));
});
// import {range, permute, getRandomInt, pick, makeMArray, makeMInvArray, getComplementModulo, getIsInverseLength, getMsInverseLength, getGroupInverse, getSolution} from 'libm12';

document.addEventListener('DOMContentLoaded', function() {
    const N = Number(new URL(window.location.toLocaleString()).searchParams.get('n'));
    let frame = undefined;
    if (N > 0 && N !== 12) {
        frame = new Frame(N);
    } else {
        frame = frame12;
    }
    const model = new Model(frame, document);

    let showSolution = false;
    let addingShortcut = false;
    let gameWidth = greatestMultipleLessThan(model.N, Math.min(516, window.screen.width));
    let tileSideWithMargin = gameWidth / model.N;
    let tileSidePx = tileSideWithMargin - 2;
    let inputSidePx = tileSidePx -2;
    let bigButtonWidth = Math.floor(tileSideWithMargin * model.N  / 2) - 2;

    const divGameContainer = document.querySelector('#game_container');
    const divNumbersHeader = document.querySelector('#numbers-header');
    const divNumbersFooter = document.querySelector('#numbers-footer');
    const divInfos = document.querySelector('#infos');
    const buttonI = document.querySelector('#I');
    const buttonM = document.querySelector('#M');
    const buttonPlus = document.querySelector('#plus');
    const divShortcuts = document.querySelector('#shortcuts');
    const buttonSaveShortcut = document.querySelector('#save_shortcut');
    const inputShortcut = document.querySelector('#input_shortcut');
    const inputShortcutName = document.querySelector('#input_shortcut_name');

    const buttonShuffle = document.querySelector('#shuffle');
    const inputShuffle = document.querySelector('#input_shuffle');
    const spanDefShortcut = document.querySelector('#def_shortcut');
    const buttonReset = document.querySelector('#reset');
    const buttonUndo = document.querySelector('#undo');
    const buttonSolution = document.querySelector('#btn_solution');
    const spanSolution = document.querySelector('#solution');
    const divTime = document.querySelector('#time');
    const divNumbers = document.querySelector('#numbers');
    const buttons = [buttonShuffle, buttonReset, buttonUndo, buttonPlus];

    function toggleOnAddShortcut() {
        addingShortcut = true;
        buttonI.onclick = plusI;
        buttonM.onclick = plusM;
        divShortcuts.childNodes.forEach(
            (btn, i) => {
                btn.onclick = () => model.applyShortcutToShortcut(i);
            });
        buttons.forEach(b => b.disabled = true);
        spanDefShortcut.style["visibility"] = "visible";
    }

    function toggleOffAddShortcut() {
        addingShortcut = false;
        buttonI.onclick = () => model.I();
        buttonM.onclick = () => model.M();
        buttons.forEach(b => b.disabled = false);
        spanDefShortcut.style["visibility"] = "collapse";
    }

    function plusI() {
        model.currentShortcut.add("I");
    }

    function plusM() {
        model.currentShortcut.add("M");
    }

    function saveShortcut() {
        model.saveCurrentShortcut(inputShortcutName.value);
        toggleOffAddShortcut();
    }
function toggleSolution() {
    showSolution = !showSolution;
    if (showSolution) {
        toggleOnSolution();
        model.updateSolution(); 
    } else {
        spanSolution.innerHTML = '' 
        toggleOffSolution();
    }
}    

function toggleOffSolution() {
    document.removeEventListener('solution changed', updateSpanSolution);
}

function updateSpanSolution(evt) {
    spanSolution.innerHTML = evt.detail.solution;
}

function toggleOnSolution() {
    document.addEventListener('solution changed', updateSpanSolution);
}

function initBigButton(button) {
    button.style.width = bigButtonWidth + "px";
    button.style.height = (2 * tileSidePx + 2) + "px";
}

function initControl(control) {
    control.style.width = tileSidePx + "px";
    control.style.height = tileSidePx + "px";
}

function initInput(input) {
    input.style.width = inputSidePx + "px";
    input.style.height = inputSidePx + "px";
}

function initDivTime() {
    divTime.style.width = (gameWidth - 2) + "px";
    divTime.style.backgroundColor = getNumberBackgroundColor(1);
    divTime.style.height = tileSidePx + "px";
    divTime.style.lineHeight = tileSidePx + "px";
}

function initDivInfos() {
    divInfos.style.width = tileSidePx + "px";
    divInfos.style.backgroundColor = getNumberBackgroundColor(1);
    divInfos.style.height = tileSidePx + "px";
    divInfos.style.lineHeight = tileSidePx + "px";
}

function initView() {
    divGameContainer.style.width = gameWidth + "px";
    initNumbersBorder(divNumbersHeader);
    initNumbersBorder(divNumbersFooter);
    initBigButton(buttonI);
    initBigButton(buttonM);
    initControl(buttonPlus);
    initControl(buttonUndo);
    initControl(buttonShuffle);
    initControl(buttonSaveShortcut);
    initControl(buttonReset);
    initControl(buttonSolution);

    initInput(inputShuffle);
    initInput(inputShortcutName);
    initInput(inputShortcut);
    initDivTime();
    initDivInfos();
}
 

function getNumberBackgroundColor(i) {
    const pct = 98 - (i - 1) / (model.N -1) * 35;
    return `hsl(240, 100%, ${pct}%)`;
}

function createNumberDiv(i) {
    const div = document.createElement("div");
    div.style.width = tileSidePx + "px";
    div.style.backgroundColor = getNumberBackgroundColor(i);
    div.className = "tile";
    return div;
}


function initNumbersBorder(divBorder) {
    divBorder.style.height = `${Math.floor(tileSidePx / 2) + 2}px`;
    divBorder.style.width = (gameWidth -2) + "px";
    divBorder.style.background = `linear-gradient(to right, hsl(240, 100%, 98%), hsl(240, 100%, 63%))`;
    divBorder.style.margin = "1px";
    divBorder.style.borderRadius = "3px";
}

function initNumbersDivs() {
    initNumbersDiv(model.numbers, divNumbers);
}

function initNumbersDiv(numbers, div) {
    div.innerHTML = "";
    for (i of numbers) {
        const subdiv = createNumberDiv(i);
        subdiv.appendChild(document.createTextNode(i));
        subdiv.style.height = tileSidePx + "px";
        subdiv.className = "tile";
        subdiv.id = "tile-" + i;
        subdiv.style.lineHeight = tileSidePx + "px";
        if (i > model.N / 2) {
            subdiv.style.color = "white";
        }
        div.appendChild(subdiv);
    }
}

function startChrono(evt) {
    model.chrono.start();
    document.removeEventListener('numbers changed', startChrono);
    document.addEventListener('solved', 
        evt => {
            divTime.innerHTML = formatDuration(evt.detail.time);
        });
}

function shuffle() {
    model.shuffle(Number(inputShuffle.value));
    document.addEventListener('numbers changed', startChrono);
}

    buttonI.onclick = () => model.I();
    buttonM.onclick = () => model.M(); 
    buttonShuffle.onclick = shuffle;
    buttonReset.onclick = () => model.reset();
    buttonUndo.onclick = () => model.undo();
    buttonSolution.onclick = () => toggleSolution();
    buttonPlus.onclick = toggleOnAddShortcut;
    buttonSaveShortcut.onclick = saveShortcut;

    document.addEventListener('keypress',
        evt => {
            const key = evt.key.toUpperCase();
            if (['I', 'M'].includes(key)) {
                model[key]();
            }
        });
    document.addEventListener('numbers changed',
        evt => {
            initNumbersDivs();
        });
    document.addEventListener('shortcuts changed',
        evt => {
            divShortcuts.innerHTML = 
                model.shortcuts
                .map(shortcut => `<button> ${shortcut.name}</button>`)
                .join(''); 
            divShortcuts.childNodes.forEach(
                (btn, i)  => { btn.onclick = () => model.applyString(model.shortcuts[i].action)});
        });

    document.addEventListener('currentShortcut changed',
        evt => {
            inputShortcut.value = model.currentShortcut.action;
            inputShortcutName.value = model.currentShortcut.name;
        });

    model.reset();
    toggleOffAddShortcut();
    initView();
    initNumbersDivs();
});

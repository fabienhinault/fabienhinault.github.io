// import {range, permute, getRandomInt, pick, makeMArray, makeMInvArray, getComplementModulo, getIsInverseLength, getMsInverseLength, getGroupInverse, getSolution} from 'libm12';

document.addEventListener('DOMContentLoaded', function() {
    const model = new Model(
        Number(new URL(window.location.toLocaleString()).searchParams.get('n')) || 12,
        document);

    let showSolution = false;
    let addingShortcut = false;
    let gameWidth = Math.min(520, window.screen.width);
    let tileSideWithMargin = Math.floor(gameWidth / model.N);
    let tileSidePx = tileSideWithMargin - 2;
    let inputSidePx = tileSidePx -2;
    let bigButtonWidth = Math.floor(tileSideWithMargin * model.N  / 2) - 2;

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
    button.style.height = tileSidePx + "px";
}

function initControl(control) {
    control.style.width = tileSidePx + "px";
    control.style.height = tileSidePx + "px";
}

function initInput(input) {
    input.style.width = inputSidePx + "px";
    input.style.height = inputSidePx + "px";
}

function initView() {
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
}
    

function initNumbers() {
    divNumbers.innerHTML = "";
    for (i of model.numbers) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(i));
        div.className = "tile";
        div.id = "tile-" + i;
        div.style.width = tileSidePx + "px";
        div.style.height = tileSidePx + "px";
        div.style.lineHeight = tileSidePx + "px";
        const pct = 100 - (i - 1) / (model.N -1) * 50;
        div.style.backgroundColor = `hsl(240, 100%, ${pct}%)`
        divNumbers.appendChild(div);
    }
}

    buttonI.onclick = () => model.I();
    buttonM.onclick = () => model.M(); 
    buttonShuffle.onclick = () => model.shuffle(Number(inputShuffle.value));
    buttonReset.onclick = () => model.reset();
    buttonUndo.onclick = () => model.undo();
    buttonSolution.onclick = () => toggleSolution();
    buttonPlus.onclick = toggleOnAddShortcut;
    buttonSaveShortcut.onclick = saveShortcut;

    document.addEventListener('numbers changed',
        evt => {
            initNumbers();
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
    initNumbers();
});

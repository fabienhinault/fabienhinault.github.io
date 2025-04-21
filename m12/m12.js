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
    const white = getNumberBackgroundColor(0);
    const blue = getNumberBackgroundColor(model.N - 1);
    const backColors = range(model.N).map(getNumberBackgroundColor);

    const divGameContainer = document.querySelector('#game_container');
    const divNumbersHeader = document.querySelector('#numbers-header');
    const divNumbersFooter = document.querySelector('#numbers-footer');
    const divInfos = document.querySelector('#infos');
    const buttonI = document.querySelector('#I');
    const imgI = document.querySelector('#I img');
    const buttonM = document.querySelector('#M');

    const buttonShuffle = document.querySelector('#shuffle');
    const divTime = document.querySelector('#time');
    const divNumbers = document.querySelector('#numbers');


function initBigButton(button) {
    button.style.width = bigButtonWidth + "px";
    button.firstChild.style.width = bigButtonWidth * 0.8 + "px";
    button.style.height = (2 * tileSidePx + 2) + "px";
    button.firstChild.style.height = (2 * tileSidePx + 2) + "px";
}

function initControl(control) {
    control.style.width = tileSidePx + "px";
    control.style.height = tileSidePx + "px";
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
    initControl(buttonShuffle);

    initDivTime();
    initDivInfos();
}

function getPosition(i) {
    return tileSidePx * (i - 1);
}

function getNumberBackgroundColor(i) {
    const pct = 98 - (i - 1) / (model.N - 2) * 35;
    return `hsl(240, 100%, ${pct}%)`;
}

function createNumberDiv(i) {
    const div = document.createElement("div");
    div.style.width = tileSidePx + "px";
    div.style.backgroundColor = backColors[i - 1];
    div.className = "tile";
    return div;
}

function initNumbersBorder(divBorder) {
    divBorder.style.height = `${Math.floor(tileSidePx / 2) + 2}px`;
    divBorder.style.width = (gameWidth -2) + "px";
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

function updateNumbersDiv(numbers, div) {
    numbers.toReversed().forEach(
        (number, index) => {
            const tile = div.querySelector(`#tile-${number}`);
            div.insertAdjacentElement('afterBegin', tile);
        }
    );
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
    model.shuffle(100);
    document.addEventListener('numbers changed', startChrono);
}

    document.documentElement.style.setProperty('--white', white);
    document.documentElement.style.setProperty('--blue', blue);
    buttonI.onclick = () => model.I();
    buttonM.onclick = () => model.M(); 
    buttonShuffle.onclick = shuffle;

    document.addEventListener('keypress',
        evt => {
            const key = evt.key.toUpperCase();
            if (['I', 'M'].includes(key)) {
                model[key]();
            }
            // I for left index
            if ('F' === key) {
                model.I();
            }
            // M for right index
            if ('J' === key) {
                model.M();
            }
        }
    );
    model.reset();
    document.addEventListener('numbers changed',
        evt => {
            updateNumbersDiv(model.numbers, divNumbers);
        }
    );
    initView();
    initNumbersDiv(model.numbers, divNumbers);
});

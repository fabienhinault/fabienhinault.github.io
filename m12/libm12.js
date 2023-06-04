function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function permute(array, permutation) {
    return permutation.map(permutationIndex => array[permutationIndex]);
}

function equalArrays(array1, array2) {
    return array1.length === array2.length &&
        array1.every((v, i) => v === array2[i]);
}

function arrayStartsWith(tested, starter) {
    return equalArrays(tested.slice(0, starter.length), starter);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function pick(array) {
    return array[getRandomInt(0, array.length)];
}

function greatestMultipleLessThan(k, sup) {
    return sup - (sup % k);
}

function getRemainingDurationUnits(allSmalls, smallsInBig) {
    const remainingSmalls = allSmalls % smallsInBig;
    return {remainingSmalls, "allBigs": (allSmalls - remainingSmalls) / smallsInBig};
}

function threeDigits(n) {
    return n.toLocaleString('fr', {minimumIntegerDigits: 3, useGrouping:false});
}

function twoDigits(n) {
    return n.toLocaleString('fr', {minimumIntegerDigits: 2, useGrouping:false});
}

function formatDuration(allMilliseconds) {
    const remainingMillis = allMilliseconds % 1000;
    const allSeconds = (allMilliseconds - remainingMillis) / 1000;
    const remainingSeconds = allSeconds % 60;
    const allMinutes = (allSeconds - remainingSeconds) / 60;
    const remainingMinutes = allMinutes % 60;
    const allHours = (allMinutes - remainingMinutes) / 60;
    let result = `${twoDigits(remainingSeconds)}.${threeDigits(remainingMillis)}`
    if (allMinutes !== 0) {
        result = `${twoDigits(remainingMinutes)}:` + result;
    }
    if (allHours !== 0) {
        result = `${twoDigits(allHours)}:` + result;
    }
    return result;
}

function getPermutationInverseRaw(rawPermutedArray) {
    let result = [];
    rawPermutedArray.forEach((element, index) => {result[element] = index;});
    return result;
}

function rawToPretty(array) {
    return array.map(v => v + 1);
}

function prettyToRaw(array) {
    return array.map(v => v - 1);
}

function getPermutationInversePretty(prettyPermutedArray) {
     return rawToPretty(getPermutationInverseRaw(prettyToRaw(prettyPermutedArray)));
 }

function getRandomMiString(len) {
    if (!len) {
        len = getRandomInt(10, 100);
    }
    let result = "";
    for(let iTime = 0; iTime < len; iTime++){
        result += pick(["I", "M"]);
    }
    return result;
}

class Frame {
    constructor(n) {
        this.N = n;
        this.mArray = makeMArray(this.N);
        this.mInvArray = getPermutationInverseRaw(this.mArray);
        this.rawGoal = range(this.N);
        this.prettyGoal = range(this.N, 1);
        this.map = {};
        this.map01 = {};
        this.solutions = {}
    }

    equalsPrettyGoal(prettyNumbers) {
        return equalArrays(prettyNumbers, this.prettyGoal);
    }
    
    equalsRawGoal(rawNumbers) {
        return equalArrays(rawNumbers, this.rawGoal);
    }
    
    M(numbers) {
        return permute(numbers, this.mArray);
    }

    I(numbers) {
        return numbers.reverse();
    }

    getMapSolution(prettyNumbers) {
        return msToMiString(this.solutions[prettyNumbers]);
    }
}


let frame12 = new Frame(12);

class MnesicRawNumbers {
    constructor(numbers, frame) {
        this.frame = frame;
        this.memory = [[...numbers]]
        this.currentNumbers = [...numbers];
    }

    I() {
        this.memory.push('I');
        this.currentNumbers = this.frame.I(this.currentNumbers);
        this.memory.push([...this.currentNumbers]);
        return this;
    }

    M() {
        this.memory.push('M');
        this.currentNumbers = this.frame.M(this.currentNumbers);
        this.memory.push([...this.currentNumbers]);
        return this;
    }

    applyString(str) {
        for (const c of str) {
            this[c]();
        }
        return this;
    }

    // M until i comes last
    msToNth(number, index) {
        if (this.currentNumbers[0] === number) {
            throw new Error(`impossible to put ${number} ${index}th on ${this.currenNumber}`);
        }
        while (this.currentNumbers[index] !== number) {
            this.M();
        }
        return this;
    }

    msToLast(number) {
        return this.msToNth(number, this.frame.N - 1);
    }

    msTo2nd(number) {
        return this.msToNth(number, 1);
    }

    msToMoRepresentant() {
       if (0 === this.currentNumbers[0]) {
           return this.msTo2nd(1);
       } else {
           return this.msTo2nd(0);
       }
    }
}

function pushEmptyBeforeI(splittedMiString) {
    if (splittedMiString[0].charAt(0) === "I") {
        splittedMiString.splice(0, 0, []);
    }
    if (splittedMiString[splittedMiString.length - 1].charAt(0) === "I") {
        splittedMiString.push([]);
    }
    return splittedMiString;
}

function msToMiString(ms) {
    return ms.map(n => "M".repeat(n)).join("I");
}

class Transform {
    constructor(miString, frame) {
        this.miString = miString;
        this.frame = frame;
        this.rawPermuted = range(this.frame.N, 0);
        for (let c of miString) {
            this.rawPermuted = this.frame[c](this.rawPermuted)
        }
        this.prettyPermuted = permute(range(this.frame.N, 1), this.rawPermuted);
    }

    getMs() {
        return pushEmptyBeforeI(split(this.miString))
            .filter((e, i) => i % 2 === 0)
            .map(str => str.length);
    }

    getName() {
        return split(this.miString)
            .map(str => if1thenEmpty(str.length.toString()) + str.charAt(0))
            .join('');
    }
}

/**
 * make the raw array (beginning at 0) for the transform M
 */
function makeMArray(n) {
    let result = [];
    for (let i = 0; i < n/2; i++) {
        result[2 * i] = i;
        const j = (2 * i) + 1;
        if (j < n) {
            result[j] = n - 1 - i;
        }
    }
    return result;
}

function makeMInvArray(n){
    let result = [];
    for (let i = 0; i < n/2; i++) {
        result[i] = 2 * i;
        const j = (2 * i) + 1;
        if (j < n) {
            result[n - 1 - i] = j;
        }
    }
    return result;
}

function getCleanedLasts(lastsString, n) {
    const identityMs = 'M'.repeat(n - 1);
    let result;
    let newResult = lastsString;
    do {
        result = newResult;
        newResult = result.replaceAll("II", "").replaceAll(identityMs, "");
    } while (newResult !== result);
    return result;
}

function isClean(str, n) {
    return str.indexOf('M'.repeat(n - 1)) === -1 && str.indexOf("II") === -1;
}

function getComplementModulo(i, n) {
    let result = (n - i) % n;
    if (result < 0) {
        result += n;
    }
    return result;
}

function getIsInverseLength(isLength) {
    return getComplementModulo(isLength, 2);
}

function getMsInverseLength(n, msLength) {
    return getComplementModulo(msLength, n- 1);
}

function getGroupInverse(n, group) {
    if (group.charAt(0) === 'M') {
        return 'M'.repeat(getMsInverseLength(n, group.length));
    } else { // 'I'
        return 'I'.repeat(getIsInverseLength(group.length));
    }
}

function split(str) {
    return str.split(/(?<=M)(?=I)/).map(s => s.split(/(?<=I)(?=M)/)).flat();
}

function getSolution(n, lastsString) {
    return split(getCleanedLasts(lastsString, n))
        .map(g => getGroupInverse(n, g))
        .reverse()
        .join('');
}

function if1thenEmpty(str) {
    if (str === "1") {
        return "";
    }
    return str;
}

function getNameFromAction(strAction) {
    return split(strAction)
        .map(str => if1thenEmpty(str.length.toString()) + str.charAt(0))
        .join('');
}

function getInvariants(cycles) {
    return cycles.filter(cycle => cycle.length === 1).map(ci => ci[0]);
}

function getCycles(rawNumbers) {
    let lookedNumbers = Array(rawNumbers.length).fill(false);
    let start = 0;
    let cycles = [];
    while (start !== -1) {
        cycles.push(getCycleFrom(rawNumbers, start, lookedNumbers));
        start = lookedNumbers.indexOf(false);
    }
    return cycles;
}

class MiComplexityGenerator {
    constructor(frame) {
        this.frame = frame;
        this.N = this.frame.N;
    }

    getStartMss(complexity) {
        return Array(complexity).fill("M");
    }

    toNext(mss) {
        const iLastRunning = mss.findLastIndex(ms => ms.length < this.N - 2);
        if (iLastRunning === -1) {
            return this.getStartMss(mss.length + 1);
        } else {
            return mss.slice(0, iLastRunning).concat(
                [mss[iLastRunning] + "M"]).concat(
                this.getStartMss(mss.length - iLastRunning - 1));
        }
    }

    *allMIs(min, max) {
        let last = this.getStartMss(min);
        while (last.length < max) {
            const str = last.join("I");
            yield str;
            yield "I" + str;
            yield str + "I";
            yield "I" + str + "I";
            last = this.toNext(last);
        }
    }
}

/**
 * rawNumbers : array, result of transform applyed to [0, 1, ... N-1]
 * */
function getCycleFrom(rawNumbers, start, lookedNumbers) {
    let current = start;
    let cycle = [];
    do {
        cycle.push(current);
        lookedNumbers[current] = true;
        current = rawNumbers[current];
    } while (current != start);
    return cycle;
}

function getStartString(len){
    // all strings from "IIII..." to "IMIM..." are dirty
    return "IM".repeat(len).substring(0, len);
}

function toNext(str, n) {
    const iLastI = str.lastIndexOf("I");
    if (iLastI === -1) {
        return getStartString(str.length + 1);
    } else {
        const next = str.substring(0, iLastI) + "M" + 
            getStartString(str.length - iLastI - 1);
        // a string with n-1 Ms is dirty. Go to the next clean.
        const iMs = next.indexOf('M'.repeat(n - 1));
        if (iMs === -1) {
            return next;
        } else {
            return toNext(next.substring(0, iMs) + "M".repeat(next.length - iMs), n);
        }
    }
}

function* allMIs(minLength, maxLength, n) {
    last = getStartString(minLength);
    while (last.length < maxLength) {
        yield last;
        last = toNext(last, n);
    }
}

// export {range, permute, getRandomInt, pick, makeMArray, makeMInvArray, getComplementModulo, getIsInverseLength, getMsInverseLength, getGroupInverse, getSolution};

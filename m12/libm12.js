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

function getPermutationInverseRaw(rawPermutedArray) {
    let result = [];
    rawPermutedArray.forEach((element, index) => {result[element] = index;});
    return result;
}

function getPermutationInversePretty(prettyPermutedArray) {
    let result = [];
    prettyPermutedArray.forEach(
        (element, index) => {result[element - 1] = index + 1;});
    return result;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function pick(array) {
    return array[getRandomInt(0, array.length)];
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
        this.map = {};
        this.map01 = {};
    }

    equalsRawGoal(rawNumbers) {
        return rawNumbers.length === this.N &&
            this.rawGoal.every((v, i) => v === rawNumbers[i]);
    }
    
    M(numbers) {
        return permute(numbers, this.mArray);
    }

    I(numbers) {
        return numbers.reverse();
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

class Transform {
    constructor(miString, frame) {
        this.miString = miString;
        this.frame = frame;
        this.rawPermuted = range(this.frame.N, 0);
        for (let c of miString) {
            this.rawPermuted = this.frame[c](this.rawPermuted)
        }
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

function getCleanedLasts(lasts, n) {
    const identityMs = 'M'.repeat(n - 1);
    let result;
    let newResult = lasts;
    do {
        result = newResult;
        newResult = result.replaceAll("II", "").replaceAll(identityMs, "");
    } while (newResult !== result);
    return result;
}

function isClean(str, n) {
    return str.indexOf('M'.repeat(n - 1)) === -1 && str.indexOf("II") === -1;
}

// function updateSolutionPush(pushed, solution, cleanedLasts) {
//     const previousLast = cleanedLasts[cleanedLasts.length - 1] || '';
//     if (previousLast != pushed) {
// 
// 
// }
// 
// function updateSolutionPop(solution, lasts) {
// }
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

function getSolution(n, lasts) {
    return split(getCleanedLasts(lasts, n))
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

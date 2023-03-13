function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function permute(array, permutation) {
    return permutation.map(permutationIndex => array[permutationIndex]);
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

class Frame {
    constructor(n) {
        this.N = n;
        this.mArray = makeMArray(n);
        this.mInvArray = getPermutationInverseRaw(this.mArray);
    }
    
    M(numbers) {
        return permute(numbers, this.arrayM);
    }

    I(numbers) {
        return numbers.reverse();
    }
}

class Transform {
    constructor(miString, frame) {
        this.miString = miSring;
        this.frame = frame;
        this.rawPermuted = range(this.frame.N, 0);
        for (c of miString) {
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

// export {range, permute, getRandomInt, pick, makeMArray, makeMInvArray, getComplementModulo, getIsInverseLength, getMsInverseLength, getGroupInverse, getSolution};

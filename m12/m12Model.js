class Shortcut {
    constructor(evtDispatcher) {
        this.name = "";
        this.action = "";
        this.nameWasSet = false;
        this.dispatcher = evtDispatcher;
    }

    dispatch(type, detail) {
        return this.dispatcher.dispatchEvent(new CustomEvent(type, {detail: detail}));
    }

    dispatchChanged() {
        this.dispatch("currentShortcut changed", this.currentShortcut);
    }
    
    add(str) {
        this.action += str;
        if (!this.nameWasSet) {
            this.updateName()
        }
        this.dispatchChanged();
    }
    
    setName(name) {
        if (this.name !== name) {
            this.nameWasSet = true;
            this.name = name;
        }
    }

    updateName() {
        this.name = getNameFromAction(this.action);
    }
}


class Model {
    constructor(frame, evtDispatcher) {
        this.frame = frame;
        this.N = this.frame.N;
	this.dispatcher = evtDispatcher;
	this.arrayM = makeMArray(this.N);
	this.arrayMInv = makeMInvArray(this.N);
	this.numbers = range(this.N, 1);
	this.lasts = [];
	this.solution = [];
	this.inverses = {
            'I': a => a.reverse(),
	    'M': a => permute(a, this.arrayMInv)
	};
        this.shortcuts = [];
        this.dispatcher.addEventListener('numbers changed', evt => {this.updateSolution();});
        this.currentShortcut = new Shortcut(evtDispatcher);
        if (Object.keys(this.frame.solutions).length !== 0) {
            this.getSolution = this.getMapSolution;
        } else {
            this.getSolution = this.getLastsSolution;
        }
    }

    getMapSolution() {
        return this.frame.getMapSolution(this.numbers);
    }

    getLastsSolution() {
        return getSolution(this.N, this.lasts.join(''));
    }

    dispatch(type, detail) {
        return this.dispatcher.dispatchEvent(new CustomEvent(type, {detail: detail}));
    }

    reinitCurrentShortcut() {
        this.currentShortcut = new Shortcut(this.dispatcher);
        this.currentShortcut.dispatchChanged();
    }

    saveCurrentShortcut(name) {
        this.shortcuts.push({...this.currentShortcut, name});
        this.dispatch("shortcuts changed", this.shortcuts);
        this.reinitCurrentShortcut();
    }

    dispatchLastsChanged() {
        return this.dispatcher.dispatchEvent(new CustomEvent("lasts changed", {detail: {lasts: this.lasts}}));
    }

    pushLasts(last) {
        this.lasts.push(last);
        return this.dispatchLastsChanged();
    }

    popLasts() {
        let popped = this.lasts.pop();
        this.dispatchLastsChanged();
        return popped;
    }

    setLasts(newLasts) {
        this.lasts = newLasts
        return this.dispatchLastsChanged();
    }

    setNumbers(newNumbers) {
        this.numbers = newNumbers;
        return this.dispatcher.dispatchEvent(new CustomEvent("numbers changed", {detail: {numbers: newNumbers}}));
    }

    updateSolution() {
        this.solution = this.getSolution();
        return this.dispatcher.dispatchEvent(new CustomEvent("solution changed", {detail: {solution: this.solution}}));
    }

    I() {
        this.pushLasts('I');
        this.setNumbers(this.numbers.reverse());
    }

    M() {
        this.pushLasts('M');
        this.setNumbers(permute(this.numbers, this.arrayM));
    }

    applyString(str) {
        for (const c of str) {
            if (c !== 'I' && c !== 'M') {
                throw new Error("invalid argument");
            }
            this[c]();
        }
    }

    applyShortcut(i) {
        this.applyString(this.shortcuts[i].action);
    }

    applyStringToShortcut(str) {
        for (const c of str) {
            this.currentShortcut.add(c);
        }
    }

    applyShortcutToShortcut(i) {
        this.applyStringToShortcut(this.shortcuts[i].action);
    }


    undo() {
        this.setNumbers(this.inverses[this.popLasts()](this.numbers));
    }

    shuffle(nShuffle) {
        if (!nShuffle) {
            this.shuffleDefault();
        } else {
            this.shuffleNTimes(nShuffle);
        }
    }

    shuffleDefault() {
        this.shuffleNTimes(getRandomInt(10,100));
    }

    shuffleNTimes(nbTimes) {
        for(let iTime = 0; iTime < nbTimes; iTime++){
            pick([() => this.I(), () => this.M()])();
        }
    }

    reset() {
        this.setNumbers(range(this.N, 1));
        this.setLasts([]);
    }

    addShortcut(name, strAction) {
        let shortcut = {name, strAction};
        shortcuts.push(shortcut);
        dispatch("added shortcut", shortcut);
    }

    playShortcut(strShortcutAction) {
       for(const c of strShortcutAction) {
           if (!["I","M"].contains(c)) {throw new Error("invalid shortcut");}
           this[c]();
       }
    }
            
};

    

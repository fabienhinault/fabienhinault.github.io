"use strict";
function enlargeVertices() {
    document.querySelectorAll('g.node').forEach(g => {
        // all vertices seem to be at least 18 away from each other.
        const extraRadius = 9;
        const ellipse = g.querySelector('ellipse');
        const clonedEllipse = ellipse.cloneNode(false);
        clonedEllipse.removeAttribute('stroke');
        clonedEllipse.setAttribute('rx', Number(clonedEllipse.getAttribute('rx')) + extraRadius);
        clonedEllipse.setAttribute('ry', Number(clonedEllipse.getAttribute('ry')) + extraRadius);
        ellipse.insertAdjacentElement('beforebegin', clonedEllipse);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    enlargeVertices();
    let last;
    let current;
    let possibleIds;

    function getNodeId(node) {
        return node.id.substring(2);
    }

    document.body.onclick = (event) => {
        const tmp = event.target.closest('svg > g > g.node');
        if (tmp && (possibleIds === undefined || possibleIds.includes(getNodeId(tmp)))) {
            last = current;
            current = tmp;
            let ellipse = current.querySelector('ellipse + ellipse')
            ellipse.setAttribute('fill', 'gray');
            if (last !== undefined) {
                document.querySelectorAll(`g._${getNodeId(last)}_`).forEach(_ => _.remove());
                last.remove();
            }
            possibleIds = nextss[getNodeId(current)];
        }
    }
});
    

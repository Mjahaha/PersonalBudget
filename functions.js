//function to add a new string to the end of the history string
function addHistory(myEnvelopes, envelopeIndex, newHistory) {
    myEnvelopes[envelopeIndex].history += ` 
    ${newHistory}`; 
}

//function to get the index of an envelope
function getEnvelopeIndex(myEnvelopes, envelopeName) {
    const envelopeIndex = myEnvelopes.findIndex( (item) => item.name === envelopeName );
    return envelopeIndex;
}

//exports my two functions
module.exports = { 
    addHistory,
    getEnvelopeIndex
};
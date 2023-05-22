const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

//global variables with envelopes 
var myEnvelopes = [];

//TODO
//create a function to find the index of an envelope and return it, also ensuring it exists
//create a function that checks if the amount is a number and replace the isNaN functions already there
//moves functions to a different file

//function to add a new string to the end of the history string
function addHistory(envelopeIndex, newHistory) {
    myEnvelopes[envelopeIndex].history += ` 
    ${newHistory}`; 
}

function getEnvelopeIndex(envelopeName) {
    const envelopeIndex = myEnvelopes.findIndex( (item) => item.name === envelopeName );
    return envelopeIndex;
}

//gets all of the envelope data
app.get('/getEnvelopes', (req, res) => {
    let envelopeData = `These are the envelope details: `; 

    if( myEnvelopes.length === 0 ) {
        console.log('No envelopes exist.');
        res.status(400).send('No envelopes exist.');
        return;
    }

    for (let i = 0; i < myEnvelopes.length; i++) {
        envelopeData += `
        ${myEnvelopes[i].name} has $${myEnvelopes[i].amount}.
        Previous Transactions:
        ${myEnvelopes[i].history}`;
        envelopeData += `
        `;
    } 

    res.status(200).send(envelopeData);
}); 

//returns the data in a single envelope
app.get('/getEnvelope', (req, res) => {
    const envelope = req.query.envelope;
    const envelopeIndex = getEnvelopeIndex( envelope );
    const envelopeAmount = myEnvelopes[envelopeIndex].amount;
    const envelopeHistory = myEnvelopes[envelopeIndex].history;
    
    //if envelope does not exist, return error
    if( envelopeIndex === -1 ) {
        console.log(`Envelope ${envelope} does not exist.`);
        res.status(400).send(`Envelope ${envelope} does not exist.`);
        return;
    }

    //if envelope exists, return data
    res.status(200).send(`Envelope ${envelope} has $${envelopeAmount}. 

    Previous Transactions: 
     ${envelopeHistory}`);
});

//create a post to add new entries to my myEnvelopes array
app.post('/createEnvelope', (req, res) => {
    const envelopeName = req.query.envelope; 
    //how can I make this a number
    const envelopeAmount = req.query.amount;
    let newEnvelope = {
        name: envelopeName
    };

    if( envelopeAmount === undefined || envelopeAmount === null || envelopeAmount === '' ) {
        newEnvelope.amount = 0;
    } else {
        newEnvelope.amount = +envelopeAmount;
        console.log(`Envelope ${newEnvelope} has $${envelopeAmount}.`);
    }
    

    //checks if the name of the envelope already exists
    for (let i = 0; i < myEnvelopes.length; i++) {
        if (myEnvelopes[i].name === envelopeName) {
            console.log(`Envelope ${envelopeName} already exists.`);
            res.status(400).send(`Envelope ${envelopeName} already exists.`);
            return;
        }
    }

    //adds history to the envelope
    newEnvelope.history = `Created envelope called  ${envelopeName} with $${envelopeAmount}.`;

    //adds the new envelope to the array
    myEnvelopes.push(newEnvelope); 
    console.log(`Added new envelope ${envelopeName}.`); 
    res.status(200).send(`It worked. Added new envelope ${envelopeName}.`); 
});

//credits or debits money to an envelope
app.put('/updateEnvelope', (req, res) => {
    const envelopeName = req.query.envelope;
    const changeAmount = +req.query.amount;  


    //if amount is not a number, return error
    if( isNaN(changeAmount) ) {
        console.log(`The amount to be added ($${changeAmount}) which is meant to be addded to ${envelopeName}, is not a number.`);
        res.status(400).send(`The amount to be added ($${changeAmount}) which is meant to be addded to ${envelopeName}, is not a number.`);
        return;
    }

    //get envelope index
    const envelopeIndex = getEnvelopeIndex( envelopeName );

    //if envelope does not exist, return error
    if ( envelopeIndex === -1) {
        console.log(`Could not transfer money. Envelope ${envelopeName} does not exist.`);
        res.status(400).send(`Could not transfer money. Envelope ${envelopeName} does not exist.`);
        return; 
    }

    let existingAmount;
    let newAmount; 
    try {
        existingAmount = myEnvelopes[envelopeIndex].amount;
        newAmount = existingAmount + changeAmount; 
        if( newAmount >= 0 ) {
            myEnvelopes[envelopeIndex].amount = newAmount;
        }   else {
            console.log(`Cannot put $${changeAmount} from ${envelopeName}. ${envelopeName} only has $${existingAmount}.`);
            res.status(400).send(`Cannot put $${changeAmount} from ${envelopeName}. ${envelopeName} only has $${existingAmount}.`);
            return;
        }
    } catch (err) {
        console.log(`Could not transfer money. Envelope ${envelopeName} does not exist. AA`);
        res.status(400).send(`Could not transfer money. Envelope ${envelopeName} does not exist. AA`);
        return;
    }

    //history of the envelope
    let history = '';
    if (changeAmount > 0) {
        history = `$${changeAmount} was added to ${envelopeName}.`;
        console.log(history);
        addHistory(envelopeIndex, history);
    } else {
        history = `$${changeAmount} was removed from ${envelopeName}. Envelope ${envelopeName} now has $${newAmount}.`;
        console.log(history);
        addHistory(envelopeIndex, history);
    }

    //return data
    res.status(200).send(`Envelope ${envelopeName} had $${existingAmount} and now has $${newAmount}.`);
});

app.put('/transferEnvelope', (req, res) => {
    const fromEnvelope = req.query.fromEnvelope;
    const toEnvelope = req.query.toEnvelope;
    const transferAmount = +req.query.transferAmount; 
    
    //if amount is not a number, return error
    if( isNaN(transferAmount) ) {
        console.log('Amount is not a number.');
        res.status(400).send('Amount is not a number.');
        return;
    }

    //get fromEnvelope index
    const fromEnvelopeIndex = getEnvelopeIndex( fromEnvelope );

    //if fromEnvelope does not exist, return error
    if ( fromEnvelopeIndex === -1) {
        console.log(`Could not transfer money. Envelope ${fromEnvelope} does not exist.`);
        res.status(400).send(`Could not transfer money. Envelope ${fromEnvelope} does not exist.`);
        return; 
    }

    //get fromEnvelope index
    const toEnvelopeIndex = getEnvelopeIndex( toEnvelope );

    //if fromEnvelope does not exist, return error
    if ( toEnvelopeIndex === -1) {
        console.log(`Could not transfer money. Envelope ${toEnvelope} does not exist.`);
        res.status(400).send(`Could not transfer money. Envelope ${toEnvelope} does not exist.`);
        return; 
    }

    //if fromEnvelope does not have enough money, return error
    let fromEnvelopeAmount = myEnvelopes[fromEnvelopeIndex].amount;
    if( fromEnvelopeAmount < transferAmount ) {
        console.log('Not enough money in fromEnvelope.');
        res.status(400).send('Not enough money in fromEnvelope.');
        return;
    }

    //if all is good, transfer money
    myEnvelopes[fromEnvelopeIndex].amount -= transferAmount;
    myEnvelopes[toEnvelopeIndex].amount += transferAmount;

    //history of the envelope
    let history = '';
    history = `$${transferAmount} was transfered from ${fromEnvelope} to ${toEnvelope}. Envelope ${fromEnvelope} now has $${myEnvelopes[fromEnvelopeIndex].amount}.`;
    addHistory(fromEnvelopeIndex, history);
    history = `$${transferAmount} was transfered from ${fromEnvelope} to ${toEnvelope}. Envelope ${toEnvelope} now has $${myEnvelopes[toEnvelopeIndex].amount}.`;
    addHistory(toEnvelopeIndex, history);

    //return data
    res.status(200).send(`Envelope ${fromEnvelope} had $${fromEnvelopeAmount} and now has $${myEnvelopes[fromEnvelopeIndex].amount}. Envelope ${toEnvelope} had $${myEnvelopes[toEnvelopeIndex].amount - transferAmount} and now has $${myEnvelopes[toEnvelopeIndex].amount}.`);

});

app.delete('/deleteEnvelope', (req, res) => {
    const envelopeName = req.query.envelope;
    const envelopeIndex = getEnvelopeIndex( envelopeName );

    //if envelope does not exist, return error
    if( envelopeIndex === -1 ) {
        console.log('Envelope does not exist.');
        res.status(400).send('Envelope does not exist.');
        return;
    }

    //if envelope exists, delete it
    myEnvelopes.splice(envelopeIndex, 1);
    console.log(`Envelope ${envelopeName} was deleted.`);
    res.status(200).send(`Envelope ${envelopeName} was deleted.`);
});

//starts the port
app.listen(PORT, () => {
    console.log('Ready to rock captain.');
});
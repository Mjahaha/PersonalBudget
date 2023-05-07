const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

//global variables with envelopes 
var myEnvelopes = [];

//gets all of the envelope data
app.get('/getEnvelopes', (req, res) => {
    res.status(200).send(`My myEnvelopes array is ${myEnvelopes}`);
}); 

//returns the data in a single envelope
app.get('/getEnvelope', (req, res) => {
    const envelope = req.query.envelope;
    const envelopeIndex = myEnvelopes.findIndex( (item) => item.name === envelope );
    const envelopeAmount = myEnvelopes[envelopeIndex].amount;
    const envelopeHistory = myEnvelopes[envelopeIndex].history;
    
    //if envelope does not exist, return error
    if( !myEnvelopes.includes(envelope) ) {
        console.log('Envelope does not exist.');
        res.status(400).send('Envelope does not exist.');
        return;
    }

    //if envelope exists, return data
    res.status(200).send(`Envelope ${envelope} has $${envelopeAmount} and has a history of ${envelopeHistory}.`);
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
        console.log('Amount is not a number.');
        res.status(400).send('Amount is not a number.');
        return;
    }

    //if envelope does not exist, return error
    let envelopeIndex;
    for (let i = 0; i < myEnvelopes.length; i++) {
        if (myEnvelopes[i].name === envelopeName) {
            envelopeIndex = i;
            break;
        } else {
            console.log('Envelope does not exist.');
            res.status(400).send('Envelope does not exist.');
            return;
        }
    }

    const existingAmount = myEnvelopes[envelopeIndex].amount;
    const newAmount = existingAmount + changeAmount;

    //change envelope amount based on data 
    if( newAmount >= 0 ) {
        myEnvelopes[envelopeIndex].amount = newAmount;
        myEnvelopes[envelopeIndex].history = myEnvelopes[envelopeIndex].history + `-${changeAmount}`;
    }   else {
        console.log('Not enough money in envelope.');
        res.status(400).send('Not enough money in envelope.');
        return;
    }

    res.status(200).send(`Envelope ${envelopeName} had $${existingAmount} and now has $${newAmount}.`);
});

//starts the port
app.listen(PORT, () => {
    console.log('Ready to rock captain.');
});
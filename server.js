const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hi');
});

app.listen(PORT, () => {
    console.log('Ready to rock captain.');
});
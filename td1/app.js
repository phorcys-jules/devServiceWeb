const express = require("express");

const app = express();
const PORT = 8321;

/**
 * Routes available
 */
app.get('/', (req, res) => res.send('Express Server'));


app.post('/', function(req, res) {
    res.json({
        firstname: "John",
        lastname: "Snow"
    }, 201)
});






//Launch the app
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});


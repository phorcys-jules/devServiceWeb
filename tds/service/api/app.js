require('dotenv').config();
const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const commandesRouter = require('./routes/commandes');
const annonceRouter = require('./routes/annonce');
const categorieRouter = require('./routes/categorie');
const departementRouter = require('./routes/departement');
const photoRouter = require('./routes/photo');
const regionRouter = require('./routes/region');


const app = express();
const PORT = 8321;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes available
 */
 app.use('/', indexRouter);
 app.use('/commandes', commandesRouter);
 //TD3 part 2
 app.use('/annonce', annonceRouter);
 app.use('/categorie', categorieRouter);
 app.use('/departement', departementRouter);
 app.use('/photo', photoRouter);
 app.use('/region', regionRouter);

 app.get('*', function (req, res) {
    res.status(400).json({
      "type": "error",
      "error": 400,
      "message": `route inconnu`});
  })


//TD6



//Launch the app
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

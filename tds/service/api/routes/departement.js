var express = require('express');
var router = express.Router();

const database = require('../knex');





/* GET commandes listing. */
router.get('/test', async function (req, res, next) {
  let data = await database.select().from('departement');
  res.json(data);
});

router.get('/', async function (req, res, next) {
  let data;
  try {
    data = await database.select().from('departement');
  } catch (error) {
    res.status(500).json(erreur(500));
  }
  res.json(data)
});


module.exports = router;
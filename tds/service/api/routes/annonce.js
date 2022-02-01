var express = require('express');
var router = express.Router();

const database = require('../knex');
const { erreur } = require('../utils/err')





/* GET commandes listing. */
router.get('/test', async function (req, res, next) {
  let data = await database.select().from('annonce');
  res.json(data);
});

router.get('/', async function (req, res, next) {
  let data;
  try {
    data = await database.select().from('annonce');
  } catch (error) {
    res.status(500).json(erreur(500));
  }
  res.json(data)
});


module.exports = router;
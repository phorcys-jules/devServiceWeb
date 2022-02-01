var express = require('express');
var router = express.Router();

const database = require('../knex');





/* GET commandes listing. */
router.get('/test', async function (req, res, next) {
  let data = await database.select().from('commande');
  res.json(data);
});

router.get('/', async function (req, res, next) {
  let data;
  try {
    data = await database.select().from('commande');
  } catch (error) {
    res.status(500).json(erreur(500));
  }
  res.json(data)
});

router.get('/:id', async function (req, res, next) {
  let commande;
  try {
    commande = await database.select().from('commande').where('id', req.params.id);
  } catch (error) {
    res.status(500).json(erreur(500));
  }
  console.log(commande);
  if (commande && commande.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvée`
    });
  } else {
    res.json(commande);
  }
});

//: nom du client, mail du client, date et heure de livraison.
router.put('/:id', async function (req, res, next) {
  let commande;
  try {
    commande = await database.from('commande').where('id', req.params.id).update({
      nom: req.body.nom,
      mail: req.body.mail,
      livraison: req.body.livraison,
      updated_at: new Date()
    });
  } catch (error) {
    //console.log(error);
    res.status(500).json(erreur(500));
  }
  //affected rows = 0
  if (commande === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvée`
    });
  } else {
    res.status(204).json(commande);
  }
});


function erreur(type) {
  switch (type) {
    case 500:
      return {
        "type": "error",
        "error": 500,
        "message": `impossible d'éxècuter la requete`
      };
      break;

    default:
      break;
  }
}


module.exports = router;

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
  let commande ={type : "ressource"};
  let toSend;
  try {
    commande.commande = (await database.select('id', 'mail', 'nom', 'created_at', 'livraison', 'montant').from('commande').where('id', req.params.id))[0];

  } catch (error) {
    res.status(500).json(erreur(500));
  }

  //console.log(commande);
  if (commande.data && commande.data.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvée`
    });
  } else {
    //mode détaillé ou l'on ajoute les items : 
    
    if (req.query.embed && req.query.embed === "items") {
      try {
        items = await database.select('id', 'uri', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
      } catch (error) {
        //res.status(500).send(error);
        res.status(500).json(erreur(500));
      }
      commande.items = items;
    }
    commande.links = {
      "items": {
        "href": `/commandes/${req.params.id}/items`
      },
      "self": {
        "href": `/commandes/${req.params.id}`
      },
    }
    //toSend  commande;
    //console.log("commande détaillé + lien : ", commande);
    //console.log("toSend : ", toSend);

    res.status(200).json(commande);

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

router.get('/:id/items', async function (req, res, next) {
  let items;
  let commande;
  try {
    //.join('item', 'item.command_id', 'commande.id');
    commande = await database.select().from('commande').where('commande.id', req.params.id);
    items = await database.select('id', 'uri', 'libelle', 'tarif', 'quantite').from('item').where('command_id', req.params.id)
  } catch (error) {
    //res.status(500).send(error);
    res.status(500).json(erreur(500));
  }

  if (commande && commande.length === 0) {
    res.status(404).json({
      "type": "error",
      "error": 404,
      "message": `commande ${req.params.id} non trouvée`
    });
  } else {
    commande = {
      "type": "collection",
      "count": items.length,
      items
    }

    res.json(commande);
  }
});

//TODO
//: nom du client, mail du client, date et heure de livraison.
router.post('/:id', async function (req, res, next) {
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
        "message": `impossible d'éxècuter la requete, vérifier la connexion à la base de données`
      };
      break;

    default:
      break;
  }
}


module.exports = router;

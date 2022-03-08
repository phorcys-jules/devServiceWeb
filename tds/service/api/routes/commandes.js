var express = require('express');
var router = express.Router();

const database = require('../knex');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const Joi = require('joi');





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
  let commande = { type: "ressource" };
  let toSend;
  try {
    commande.commande = (await database.select('id', 'mail', 'nom', 'created_at', 'livraison', 'montant', 'token').from('commande').where('id', req.params.id))[0];

  } catch (error) {
    res.status(500).json(erreur(500));
  }
  if (req.headers.x_lbs_token != commande.commande.token  && (req.query.token && req.query.token != commande.commande.token)) {
    return res.status(401).json(erreur(401));

  }

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


//: nom du client, mail du client, date et heure de livraison.
router.post('/', async function (req, res, next) {
  const schema = Joi.object().keys({
    livraison: Joi.object().keys({
      //date: Joi.date().greater('now').required(),
      date: Joi.date().required(),
      heure: Joi.string().required(),
    }),
    nom: Joi.string().required(),
    mail: Joi.string().email().required(),
    items: Joi.array().items(Joi.object().keys({
      libelle: Joi.string().required(),
      uri: Joi.string().required(),
      quantite: Joi.number().required(),
      tarif: Joi.number().required(),
    }))
  })

  try {
    Joi.assert(req.body, schema)
  } catch (error) {
    return res.status(422).send("wrong inputs");
  }

  let commandeToAdd;
  let itemsToAdd = [];
  let DBResult;
  let command_id = uuidv4();
  let montant = 0;

  if (!req.body.items || req.body.items.length < 1) {
    //erreur items vide
    return res.status(400).json(erreur(4001));
  }
  req.body.items.forEach(itm => {
    itemsToAdd.push({
      uri: itm.uri,
      quantite: itm.quantite,
      libelle: itm.libelle,
      tarif: itm.tarif,
      command_id: command_id
    })
    montant+= itm.tarif*itm.quantite;
  });
  try {
    //items
    DBResult = await database.insert(itemsToAdd).into("item");
  } catch (error) {
    console.log("errrrrrrr,   ", error);
  }
  console.log("montant : ", montant);

  try {
    //commande
    commandeToAdd = {
      id: command_id,
      created_at: new Date(),
      updated_at: new Date(),
      livraison: req.body.livraison.date + ' ' + req.body.livraison.heure,
      nom: req.body.nom,
      mail: req.body.mail,
      token: uuidv4(),
      montant: montant

    }
    DBResult = await database.insert(commandeToAdd).into("commande");

  } catch (error) {
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      res.status(400).json(erreur(400));
    }
    console.log(error);

    res.status(500).json(erreur(500));
  }
  res.status(201).json({ commande: commandeToAdd })
});


function erreur(type) {
  switch (type) {
    case 400:
      return {
        "type": "error",
        "error": 400,
        "message": `impossible d'éxècuter la requete, la synthaxe ne correspond pas à ce qui est attendu`
      };
    case 4001:
      return {
        "type": "error",
        "error": 400,
        "message": `impossible d'éxècuter la requete, une commande ne peut pas être vide`
      };
    case 401:
      return {
        "type": "error",
        "error": 401,
        "message": `Vous n'êtes pas authorisé à effectuer cette action`
      };
    case 500:
      return {
        "type": "error",
        "error": 500,
        "message": `impossible d'éxècuter la requete, vérifier la connexion à la base de données`
      };

    default:
      break;
  }
}


module.exports = router;

var express = require('express');
var router = express.Router();

const database = require('../knex');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const Joi = require('joi');





/* GET commandes listing. */

router.get('/', async function (req, res, next) {
  let page = parseInt(req.query.page) || 1;
  let size =  parseInt(req.query.size) || 15;
  let nextPage=1;
  let prevPage=1;
  let uri = '/commandes/?';
  let data = {
    type: "collection",
    count: 0,
    size:size,
    commands: [],
    links:{}
  };

  try {
    //si l'on veut filtrer selon l'état de la commande
    if (req.query.s) {
      uri = `/commandes/?s=${req.query.s}&`; //on adapte les links
      data.commands = await database.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').where('status','=',req.query.s).paginate({perPage : size, currentPage: page, isLengthAware: true});
    }else {
      data.commands = await database.select('id', 'nom', 'created_at', 'livraison', 'status').from('commande').paginate({perPage : size, currentPage: page, isLengthAware: true});
    }
  } catch (error) {
    return res.status(500).json(erreur(500));
    //res.status(500).send(error);
    
  }
  
  if (data.commands.pagination.currentPage === data.commands.pagination.lastPage){
    nextPage = data.commands.pagination.currentPage;
  } else {
    nextPage = data.commands.pagination.currentPage++;
  }
  if (data.commands.pagination.currentPage === 1){
    nextPage = 1;
  } else {
    nextPage = data.commands.pagination.currentPage++;
  }
  data.links = {
    "next": {
      "href": `${uri}page=${nextPage}&size=${size}`
      },
      "prev": {
      "href": `${uri}page=${prevPage}&size=${size}`
      },
      "last": {
      "href": `${uri}page=${data.commands.pagination.lastPage}&size=${size}`
      },
      "first": {
      "href": `${uri}page=1&size=${size}`
      }    
  }

  data.count = data.commands.pagination.total;
  data.commands = data.commands.data;
  data.size = data.commands.length;
  data.commands.forEach(commmande => {
    //commmande.commmand = commmande;
    //commmande = {commmand: commmande};
    commmande.links = {
      "self": {
        "href": `/commandes/${commmande.id}`
      },
    }
  });
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

    res.status(200).json(commande);

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

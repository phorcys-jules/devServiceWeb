install with npm i

run with npm start

Routes :

    ✔️Lister les commandes : http://localhost:8321/commandes

    ✔️Obtenir les infos sur 1 commande : http://localhost:8321/commandes/id

    ✔️Obtenir les infos détaillé sur 1 commande : http://localhost:8321/commandes/id?embed=items

    ✔️Modifier une commande : PUT http://localhost:8321/commandes/id
        body : {nom, mail, livraison}

    ✔️Créer une commande : POST http://localhost:8321/commandes/
        body : {
            nom, mail,
            livraison: {
                "date": "YYYY-MM-DD",
                "heure": "HH:MM"
            },
            "items": [
                {
                    "uri": "/sandwiches/6",
                    "quantite": 3,
                    "libelle": "panini",
                    "tarif": 6.00
                },
                {
                    "uri": "/sandwiches/1",
                    "quantite": 2,
                    "libelle": "bucheron",
                    "tarif": 6.00
                }
            ]
        }

    ✔️Obtenir la liste des items d'une commande http://localhost:8321/commandes/id/items


Idée d'amélioration :
    token commande en jwt encodé en base 64 avec une certaine durée de validité
    verif token chaque opération sur commande
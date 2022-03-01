install with npm i
run with npm start

Routes : 
    ✔️Lister les commandes : http://localhost:8321/commandes
    ✔️Obtenir les infos sur 1 commande : http://localhost:8321/commandes/id
    ✔️Obtenir les infos détaillé sur 1 commande : http://localhost:8321/commandes/id?embed=items
    ✔️Modifier une commande : PUT http://localhost:8321/commandes/id
        body : {nom, mail, livraison}
    ✔️Obtenir la liste des items d'une commande http://localhost:8321/commandes/id/items
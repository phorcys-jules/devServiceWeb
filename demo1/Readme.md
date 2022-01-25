# Demo IUT

## Var d'env
    -./service/.env

## commande utile
    - Install dep :
        `docker-compose run iut_service npm i`
    - Lancer docker :
        `docker-compose up iut_service` 
    - entrer dans le container 
        `docker exec -ti iut_service bash`
    - Consulter l'api
        `curl http:\\localhost:3333`


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

  module.exports =  {
      erreur
  }
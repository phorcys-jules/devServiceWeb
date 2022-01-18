const {v4: uuidv4}  = require('uuid');

class Robot {
    constructor(color) {
        this.ref = uuidv4();
        this.color = color;
    }

    who_am_i(){
        return `I'm ${this.ref} colored in ${this.color}`;
    }
}

module.exports = {
    Robot
}
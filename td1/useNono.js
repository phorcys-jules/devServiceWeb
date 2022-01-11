const { Robot } =  require("./classes/Robot");
const { say_hello, sum } =  require("./utils/hello");

say_hello("World");

const total = sum(1,1);

console.log(total);

const nono = new Robot("red")
console.log(nono.who_am_i());
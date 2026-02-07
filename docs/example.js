const fs = require('fs');

console.log("Starting");

fs.readFile('input.txt', ()=> {
  console.log("Fileread callback executed");

  setTimeout(() => {
    console.log("Timer callback executed");
  }, 0);

  setImmediate(() => {
    console.log("Immediate callback executed");
  });

  process.nextTick(() => {
    console.log("nextTick callback executed");
  });
});

console.log("Finishing");
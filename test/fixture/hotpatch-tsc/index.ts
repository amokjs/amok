let previous = null;

setInterval(() => {
  var value = 'step-0';
  if (value !== previous) {
    console.log(value);
    previous = value;
  }
}, 0);

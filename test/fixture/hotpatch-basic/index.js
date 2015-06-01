var previous = null;

setInterval(function() {
  var value = 'step-0';
  if (value !== previous) {
    console.log(value);
    previous = value;
  }
}, 0);

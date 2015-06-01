console.log('ready');

window.addEventListener('add', function(event) {
  console.assert(event.detail.filename);
  console.log('add ' + event.detail.filename);
});

window.addEventListener('change', function(event) {
  console.assert(event.detail.filename);
  console.log('change ' + event.detail.filename);
});

window.addEventListener('unlink', function(event) {
  console.assert(event.detail.filename);
  console.log('unlink ' + event.detail.filename);
});

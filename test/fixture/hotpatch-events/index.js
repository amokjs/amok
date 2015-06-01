window.addEventListener('patch', function(event) {
  console.assert(event.detail.filename);
  console.assert(event.detail.source);

  console.log('patch ' + event.detail.filename);
});

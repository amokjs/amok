console.log('ready');

process.on('fileCreate', filename => {
  console.assert(filename);
  console.log('fileCreate ' + filename);
});

process.on('fileChange', filename => {
  console.assert(filename);
  console.log('fileChange ' + filename);
});

process.on('fileRemove', filename => {
  console.assert(filename);
  console.log('fileRemove ' + filename);
});


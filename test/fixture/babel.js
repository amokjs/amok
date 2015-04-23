console.log(`ok`);

if (typeof (window) !== `undefined`) {
  window.addEventListener(`add`, function(event) {
    if (event.detail.search(`plain.js`) > -1) {
      console.log(`add ${event.detail}`);
    }
  });

  window.addEventListener(`change`, function(event) {
    if (event.detail.search(`plain.js`) > -1) {
      console.log(`change ${event.detail}`);
    }
  });

  window.addEventListener(`source`, function(event) {
    if (event.detail.search(`plain.js`) > -1) {
      console.log(`source ${event.detail}`);
    }
  });
}

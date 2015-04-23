console.log 'ok'

if typeof window != 'undefined'
  window.addEventListener 'add', (event) ->
    if event.detail.search('plain.js') > -1
      console.log 'add', event.detail
    return

  window.addEventListener 'change', (event) ->
    if event.detail.search('plain.js') > -1
      console.log 'change', event.detail
    return

  window.addEventListener 'source', (event) ->
    if event.detail.search('plain.js') > -1
      console.log 'source', event.detail
    return

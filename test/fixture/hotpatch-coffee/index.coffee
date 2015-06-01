previous = null

setInterval (->
  value = 'step-0'
  if value != previous
    console.log value
    previous = value
  return
), 0

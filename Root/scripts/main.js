var list = document.querySelector('.output ul')
list.innerHTML = ''
var strs = ['MAN675847583748sjt567654;Manchester Piccadilly',
'GNF576746573fhdg4737dh4;Greenfield',
'LIV5hg65hd737456236dch46dg4;Liverpool Lime Street',
'SYB4f65hf75f736463;Stalybridge',
'HUD5767ghtyfyr4536dh45dg45dg3;Huddersfield'];

strs.forEach(str => {
  let stageCode = str.slice(0,3)

  let name = str.slice(str.indexOf(';') + 1)

  let r = document.createElement('li')

  r.textContent = stageCode + ":\t" + name

  list.appendChild(r)
});
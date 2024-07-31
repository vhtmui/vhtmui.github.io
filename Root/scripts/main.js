const section = document.querySelector('section');

let para1 = document.createElement('p');
let para2 = document.createElement('p');
let motherInfo = 'The mother cats are called ';
let kittenInfo;
const requestURL = 'https://mdn.github.io/learning-area/javascript/oojs/tasks/json/sample.json';

fetch(requestURL)
    .then(response => response.text())
    .then(text => displayCatInfo(text))

function displayCatInfo(catString) {
    let total = 0;
    let male = 0;

    // Add your code here
    const a = JSON.parse(catString);
    const mothers = new Array;
    for (const key in a) {
        mothers.push(a[key].name);
        a[key].kittens.forEach(element => {
            total += 1;
            if (element.gender === 'm') {
                male += 1;
            }
        });
    }
    motherInfo += mothers.join(', ');
    // Don't edit the code below here!
    kittenInfo = `The total kittens is ${total} The number of male is ${male}`
    para1.textContent = motherInfo;
    para2.textContent = kittenInfo;
}

section.appendChild(para1);
section.appendChild(para2);
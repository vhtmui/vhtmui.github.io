const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */
const imgFile = ["pic1.jpg","pic2.jpg","pic3.jpg","pic4.jpg","pic5.jpg"];
/* Declaring the alternative text for each image file */
const imgText = ["1","2","3","4","5"];
/* Looping through images */
for (img in imgFile) {
    let i = document.createElement("img");
    i.src = "images/" + imgFile[img];
    i.alt = imgText[img];
    thumbBar.appendChild(i);
}

/* Wiring up the Darken/Lighten button */
btn.addEventListener("click",(event)=>{
    if (btn.textContent === "Darken") {
        overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
        btn.textContent = "Lighten";
    }else{
        btn.textContent = "Darken";
        overlay.style.backgroundColor = "rgba(0,0,0,0)";
    }
})

thumbBar.addEventListener("click",(event)=>{
    const src = event.target.src;
    displayedImage.setAttribute("src",src);
})
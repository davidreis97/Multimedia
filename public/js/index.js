
let nyanbutton = document.getElementById("nyanbutton");
let shutupbutton = document.getElementById("shutupbutton");

var nyanmusic = new Howl({
    src: ['/audio/nyancat.mp3'],
    autoplay: false,
});

nyanbutton.onclick = (evt) => {
    nyanmusic.play();
}

shutupbutton.onclick = (evt) => {
    nyanmusic.pause();
}

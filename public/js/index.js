//CONSTANTS
const maxBeats = 16;
const beatsPerMinute = 400;
const gridelement = document.getElementById("music-grid");
const nyanbutton = document.getElementById("nyanbutton");
const shutupbutton = document.getElementById("shutupbutton");

//MAIN - Runs at start of page

let grid = []; //grid[line][row]
let sounds = ['/drums/Snares/Snare 1.wav','/drums/Percs/Perc 8.wav','/drums/Kick/Kick 1.wav','/drums/Bass/Bass 3 (C#).wav']; //Index in this array should be the same as their line
let currentBeat = 0;

createNewLine();
createNewLine();
createNewLine();
createNewLine();

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

//FUNCTIONS

function createNewLine(){
    let tr = document.createElement("tr");
    let gridLine = new Array(maxBeats);
    for(let row = 0; row < maxBeats; row++){
        let td = document.createElement("td");
        let div = document.createElement("div");
        div.classList.add("square","scale-out-center");
        let line = grid.length.valueOf();
        td.onclick = () => {
            toggleSquare(line,row);
        };
        div.id = "music-" + line + "-" + row;
        td.appendChild(div);
        tr.appendChild(td);
        gridLine[row] = false;
    }
    grid.push(gridLine);
    gridelement.appendChild(tr);
}

function highlightRow(row) {
    for(let i = 0; i < grid.length; i++){
        document.getElementById("music-" + i + "-" + row).parentElement.style.background = "rgba(50, 50, 50, .3)";
    }
}

highlightRow(0);

function unhighlightRow(row) {
    for(let i = 0; i < grid.length; i++){
        document.getElementById("music-" + i + "-" + row).parentElement.style.background = "rgba(50, 50, 50, 0)";
    }
}

function toggleSquare(line, row){
    let div = document.getElementById("music-" + line + "-" + row);
    grid[line][row] = !grid[line][row];

    if(grid[line][row]){
        div.classList.remove("scale-out-center");
        div.classList.add("scale-in-center");
    }else{
        div.classList.remove("scale-in-center");
        div.classList.add("scale-out-center");
    }
}

function mainLoop(){
    unhighlightRow(currentBeat);
    
    currentBeat = (currentBeat + 1) % maxBeats;

    for(let i = 0; i < grid.length; i++){
        if(grid[i][currentBeat]){
            new Howl({
                src: sounds[i],
                autoplay: true,
            });
        }
    }

    highlightRow(currentBeat);
}
setInterval(mainLoop,1000/(beatsPerMinute/60));
//CONSTANTS
const gridelement = document.getElementById("music-grid");
const nyanbutton = document.getElementById("nyanbutton");
const shutupbutton = document.getElementById("shutupbutton");
const playpause = document.getElementById("playpause");
const morecolumns = document.getElementById("morecolumns");
const lesscolumns = document.getElementById("lesscolumns");

//MAIN - Runs at start of page

let grid = []; //grid[line][column]
let sounds = ['/drums/Snares/Snare 1.wav','/drums/Percs/Perc 8.wav','/drums/Kick/Kick 1.wav','/drums/Bass/Bass 3 (C#).wav']; //Index in this array should be the same as their line
let currentBeat = 0;
let playing;
let maxBeats = 16;
let beatsPerMinute = 500;

createNewLine();
createNewLine();
createNewLine();
createNewLine();

updatecolumnNum();

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

document.onkeydown = (evt) => {
    if (evt.key == " "){
        togglePlaying();
    }
}

playpause.onclick = (evt) => {
    togglePlaying();
}

morecolumns.onclick = (evt) => {
    createNewcolumn();
}

lesscolumns.onclick = (evt) => {
    deleteLastcolumn();
}
//FUNCTIONS

function togglePlaying(){
    if(playing){
        pause();
        playpause.classList.remove("pause");
        playpause.classList.add("play");
    }else{
        play();
        playpause.classList.remove("play");
        playpause.classList.add("pause");
    }
}

function createNewBeat(line,column){
    let td = document.createElement("td");
    let div = document.createElement("div");
    div.classList.add("square","scale-out-center");
    td.onclick = () => {
        toggleSquare(line,column);
    };
    div.id = "music-" + line + "-" + column;
    td.appendChild(div);

    return td;
}

function updatecolumnNum(){
    let columnnumb = document.getElementById("columnnumb");
    columnnumb.innerText = "" + grid[0].length + " columns";
}

function deleteLastcolumn(){
    let columnToDelete = grid[0].length - 1;
    for(let line = 0; line < grid.length; line++){
        let td = document.getElementById("music-"+line+"-"+columnToDelete).parentNode;
        td.parentNode.removeChild(td);
        grid[line].pop();
    }
    maxBeats--;
    updatecolumnNum();
}

function createNewcolumn(){
    for(let line = 0; line < grid.length; line++){
        let tr = document.getElementById("music-"+line);
        tr.appendChild(createNewBeat(line,maxBeats));
        grid[line].push(false);
    }
    maxBeats++;
    updatecolumnNum();
}

function createNewLine(){
    let tr = document.createElement("tr");
    tr.id = "music-" + grid.length.valueOf();
    let gridLine = new Array(maxBeats);
    for(let column = 0; column < maxBeats; column++){
        let line = grid.length.valueOf();
        tr.appendChild(createNewBeat(line,column));
        gridLine[column] = false;
    }
    grid.push(gridLine);
    gridelement.appendChild(tr);
}

function highlightcolumn(column) {
    for(let i = 0; i < grid.length; i++){
        document.getElementById("music-" + i + "-" + column).parentElement.style.background = "rgba(50, 50, 50, .3)";
    }
}

highlightcolumn(0);

function unhighlightcolumn(column) {
    for(let i = 0; i < grid.length; i++){
        document.getElementById("music-" + i + "-" + column).parentElement.style.background = "rgba(50, 50, 50, 0)";
    }
}

function toggleSquare(line, column){
    let div = document.getElementById("music-" + line + "-" + column);
    grid[line][column] = !grid[line][column];

    if(grid[line][column]){
        div.classList.remove("scale-out-center");
        div.classList.add("scale-in-center");
    }else{
        div.classList.remove("scale-in-center");
        div.classList.add("scale-out-center");
    }
}

function backTo0(){
    unhighlightcolumn(currentBeat);
    currentBeat = 0;
    highlightcolumn(currentBeat);
}

function play(){
    console.log("Playing");
    playing = setInterval(mainLoop,1000/(beatsPerMinute/60));
}

function pause(){
    console.log("Pausing");
    clearInterval(playing);
    playing = null;
}

function mainLoop(){
    unhighlightcolumn(currentBeat);
    
    currentBeat = (currentBeat + 1) % maxBeats;

    for(let i = 0; i < grid.length; i++){
        if(grid[i][currentBeat]){
            new Howl({
                src: sounds[i],
                autoplay: true,
            });
        }
    }

    highlightcolumn(currentBeat);
}
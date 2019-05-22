//CONSTANTS
const gridelement = document.getElementById("music-grid");
const playpause = document.getElementById("playpause");
const morecolumns = document.getElementById("morecolumns");
const lesscolumns = document.getElementById("lesscolumns");
const bpmvalue = document.getElementById("bpmvalue");
const addInstrumentFinal = document.getElementById("addInstrumentFinal");
const newInstTitle = document.getElementById("newInstTitle");
const newInstURL = document.getElementById("newInstURL");
const formatSelect = document.getElementById("formatSelect");
const deleteLastInstrument = document.getElementById("deleteLastInstrument");
const clearGridElem = document.getElementById("clearGridElem");
const controls = document.getElementById("controls");
const collapseGridButton = document.getElementById("collapseGridButton");
const toggleMIDIInput = document.getElementById("toggleMIDIInput");
const MIDIInputSelect = document.getElementById("MIDIInputSelect");
// const waveDiv = document.getElementById("wave");
const polyphonic = document.getElementById("polyphonic");
const afterCanvas = document.getElementById("afterCanvas");

//MAIN - Runs at start of page

/*
---------------------
    WAVE DRAWING
---------------------
*/

let lerpRate = 0.15; //Percentage of value to change
let lerpSpeed = 10; //ms
let lerpTolerance = 0.01;

class MyWave {
    constructor(freq,amplitude,speed, angle = 0) {
        this.freq = freq;
        this.amplitude = amplitude;
        this.speed = speed;
        this.angle = angle;
        this.oldAngle = angle;

        this.nextFreq = freq;
        this.nextAmplitude = amplitude;
        this.nextSpeed = speed;

        window.setInterval(()=>{this.checkChanges(this)},lerpSpeed);
    }

    setFreq(newFreq){
        this.nextFreq = newFreq;
    }

    setAmplitude(newAmp){
        this.nextAmplitude = newAmp;
    }

    setSpeed(newSpeed){
        this.nextSpeed = newSpeed;
    }

    checkChanges(obj){
        obj.interpolate(obj.freq, obj.nextFreq, (val)=>{obj.freq = val;});
        obj.interpolate(obj.amplitude, obj.nextAmplitude, (val)=>{obj.amplitude = val;});
        obj.interpolate(obj.speed, obj.nextSpeed, (val)=>{obj.speed = val;});
    }

    interpolate(initialValue, finalValue, callback){
        if(initialValue == finalValue){
            return;
        }

        if (abs(initialValue-finalValue) <= lerpTolerance){
            initialValue = finalValue;
            callback(initialValue);
            return;
        }

        initialValue = lerp(initialValue,finalValue,lerpRate);

        callback(initialValue);
    }
}

function getActiveWaves(){
    activeWaves = [];

    for(wave of waves){
        if(wave.amplitude > 0 && wave.freq > 0){
            activeWaves.push(wave);
        }
    }

    return activeWaves;
}

let waves = [
    //new MyWave(30,0.15,1),
    new MyWave(40,0.6,-0.4),
   new MyWave(23,0.2,0.2),
    new MyWave(09,0.43,-0.6),
    //new MyWave(72,0.98,1.9),
   // new MyWave(13,0.6,0),
    new MyWave(34,0.34,-0.3),
    //new MyWave(19,0.16,1.2),
    //new MyWave(5,0.78,0.3),
]

let angle = 0;
let maxAmplitude = 80.0;
let accuracy = 6; //The higher, the worse
let frameRateValue = 50;

let upColor = {
    r: 43,
    g: 62,
    b: 80
}

let downColor = {
    r: 180,
    g: 230,
    b: 100
}

function setup() {
    let canvas = createCanvas(window.innerWidth, 2*maxAmplitude);
    frameRate(frameRateValue);
    canvas.parent('wave');
    strokeWeight(accuracy);
    noSmooth();
    strokeCap(SQUARE);
}

afterCanvas.style.background = "rgb(" + downColor.r + "," + downColor.g + "," + downColor.b + ")";
afterCanvas.style.marginTop = -maxAmplitude + "px";

function draw() {
    clear();
    let inc = accuracy / window.innerWidth;
    
    for(let wave of waves){
        wave.oldAngle = wave.angle;
    }

    for (let i = 0; i <= window.innerWidth; i+=accuracy) {
        let height = 0;
        let nonZeroWaves = 0;

        for(let wave of waves){
            if(wave.amplitude > 0){
                nonZeroWaves += wave.amplitude;
                height += sin(wave.freq * wave.angle) * (wave.amplitude * maxAmplitude);
            }

            wave.angle += inc;
        }

        height /= nonZeroWaves;

        height += maxAmplitude;

        if(height <= maxAmplitude){
            stroke(downColor.r,downColor.g,downColor.b);
            line(i,height,i,maxAmplitude);
        }else if(height > maxAmplitude){
            stroke(upColor.r,upColor.g,upColor.b);
            line(i,height,i,maxAmplitude);
        }
    }
    
    for(let wave of waves){
        if (wave.amplitude > 0){
            wave.angle = wave.oldAngle;
            wave.angle += -wave.speed / 100 * 60 / frameRateValue;
            if (wave.angle >= TWO_PI){
                wave.angle = 0;
            }
        }
    }
}

//Enable tooltips (cenas que mostram volume quando passas la com o rato)
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$('#newInstrumentModal').on('hide.bs.modal', function (e) {
    makeKeyboardToggle();
})

$('#newInstrumentModal').on('show.bs.modal', function (e) {
    document.onkeydown = null;
})

let grid = []; //grid[line][column]
let soundName = []; //Cada indice é uma linha, o elemento é o nome do ficheiro
let sounds = [];
let currentBeat = 0;
let playing;
let maxBeats = 16;
let beatsPerMinute = 500;
let midiEnabled = false;

createNewLine('Snare 1', '/inst?id=/drums/Snares/Snare 1.wav', "wav");
createNewLine('Perc 8', '/inst?id=/drums/Percs/Perc 8.wav', "wav");
createNewLine('Kick 1', '/inst?id=/drums/Kick/Kick 1.wav', "wav");
createNewLine('Bass 3', '/inst?id=/drums/808s/808 1 (C).wav', "wav");

updatecolumnNum();

makeKeyboardToggle();

bpmvalue.value = beatsPerMinute;

bpmvalue.oninput = (evt) => {
    beatsPerMinute = bpmvalue.value;
    clearInterval(playing);
    if (playing) {
        playing = setInterval(mainLoop, 1000 / (beatsPerMinute / 60));
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

addInstrumentFinal.onclick = (evt) => {
    createNewLine(newInstTitle.value, newInstURL.value, formatSelect.value);
}

deleteLastInstrument.onclick = (evt) => {
    deleteLastLine();
}

clearGridElem.onclick = (evt) => {
    clearGrid();
}

let collapsed = false;
collapseGridButton.onclick = () => {
    if(collapsed == true){
        collapseGridButton.innerHTML = '<span class="oi oi-arrow-thick-top"></span> Collapse';
        $('#collapsibleGrid').collapse('show');
        controls.style.borderBottomLeftRadius = "0px";
        controls.style.borderBottomRightRadius = "0px";
    }else{
        collapseGridButton.innerHTML = '<span class="oi oi-arrow-thick-bottom"></span> Expand';
        $('#collapsibleGrid').collapse('hide');
        controls.style.borderBottomLeftRadius = "10px";
        controls.style.borderBottomRightRadius = "10px";
    }
    collapsed = !collapsed;
}

addEventListenersToTableOfMisery();

/*
-----------------------
    MIDI CONTROLLER
-----------------------
*/

toggleMIDIInput.onclick = enableMIDI;

let synth = new Tone.Synth().toMaster();

let currentNote = "";

polyphonic.oninput = (evt) => {
    if(polyphonic.checked === true){
        synth.dispose();
        synth = new Tone.PolySynth(8).toMaster();
    }else if(polyphonic.checked === false){
        synth.dispose();
        synth = new Tone.Synth().toMaster();
    }
}

MIDIInputSelect.oninput = (evt) => {
    if(MIDIInputSelect.value != 0){
        let midiInput = WebMidi.getInputById(MIDIInputSelect.value);

        if (midiInput){
            midiInput.addListener("noteon","all",(evt) => {
                currentNote = evt.note.name + "" + evt.note.octave;
                if(polyphonic.checked){
                    synth.triggerAttack(currentNote);
                }else{
                    synth.triggerAttack(currentNote,null,evt.note.velocity);
                }
            });

            midiInput.addListener("noteoff","all",(evt) => {
                if(polyphonic.checked){
                    synth.triggerRelease(evt.note.name + "" + evt.note.octave); //Polyphonic
                }else{
                    if (evt.note.name + "" + evt.note.octave == currentNote){
                        synth.triggerRelease(); //Monophonic
                    }
                }                
            });

            console.log("Successfully listening to midi input with id [" + MIDIInputSelect.value +"]");
        }else{
            console.log("Could not get midi input with id [" + MIDIInputSelect.value + "]");
        }
    }
}
//FUNCTIONS

function enableMIDI() {
    WebMidi.enable(function (err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            $('#midiForm').collapse('show');
            toggleMIDIInput.innerText = "Disable MIDI Input";
            toggleMIDIInput.classList.replace("btn-success", "btn-danger");
            toggleMIDIInput.onclick = disableMIDI;
            midiEnabled = true;

            for (let input of WebMidi.inputs) {
                let option = document.createElement("option");
                option.innerText = "Name: " + input.name + " / Manufacturer: " + input.manufacturer;
                option.value = input.id;

                MIDIInputSelect.appendChild(option);
            }
        }
    });
}

function disableMIDI() {
    WebMidi.disable();
    $('#midiForm').collapse('hide');
    toggleMIDIInput.innerText = "Enable MIDI Input";
    toggleMIDIInput.classList.replace("btn-danger", "btn-success");
    toggleMIDIInput.onclick = enableMIDI;
    midiEnabled = false;
}

function addEventListenersToTableOfMisery() {
    let tableOfMisery = document.getElementById("tableOfMisery");
    for (let tr of tableOfMisery.children) {
        for (let td of tr.children) {
            td.onclick = (evt) => {
                newInstTitle.value = td.getAttribute("title");
                newInstURL.value = td.getAttribute("value");
                formatSelect.value = "wav"; //All sounds in our library are wav.
                getInstrumentFromServer(newInstURL.value, true, formatSelect.value);
            }
        }
    }
}

function makeKeyboardToggle() {
    document.onkeydown = (evt) => {
        if (evt.key == " ") {
            togglePlaying();
            evt.preventDefault();
        }
    }
}

function togglePlaying() {
    if (playing) {
        pause();
        playpause.classList.remove("pause");
        playpause.classList.add("play");
    } else {
        play();
        playpause.classList.remove("play");
        playpause.classList.add("pause");
    }
}

function createNewBeat(line, column) {
    let td = document.createElement("td");
    let div = document.createElement("div");
    div.classList.add("square", "scale-out-center");
    td.onclick = () => {
        toggleSquare(line, column);
    };
    div.id = "music-" + line + "-" + column;
    td.appendChild(div);

    return td;
}

function updatecolumnNum() {
    let columnnumb = document.getElementById("columnnumb");
    columnnumb.innerText = "" + grid[0].length + " columns";
}

function deleteLastLine() {
    let lastLine = document.getElementById("music-" + (grid.length - 1));
    lastLine.parentNode.removeChild(lastLine);
    grid.pop();
}

function deleteLastcolumn() {
    let columnToDelete = grid[0].length - 1;
    for (let line = 0; line < grid.length; line++) {
        let td = document.getElementById("music-" + line + "-" + columnToDelete).parentNode;
        td.parentNode.removeChild(td);
        grid[line].pop();
    }
    maxBeats--;
    updatecolumnNum();
}

function createNewcolumn() {
    for (let line = 0; line < grid.length; line++) {
        let tr = document.getElementById("music-" + line);
        tr.appendChild(createNewBeat(line, maxBeats));
        grid[line].push(false);
    }
    maxBeats++;
    updatecolumnNum();
}

function initialBox(instName, lineNum) {
    let td = document.createElement("td");
    td.style.padding = "6px";

    let div = document.createElement("div");
    div.style.height = "66px";
    div.style.width = "7em";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.justifyContent = "space-between";

    let p = document.createElement("p");
    p.style.overflow = "hidden";
    p.innerText = 1 + lineNum + ". " + instName;
    p.style.whiteSpace = "nowrap";
    p.style.margin = "0";
    p.style.padding = "0";

    let volumeDiv = document.createElement("div");
    volumeDiv.style.display = "flex";
    volumeDiv.style.width = "7em";
    volumeDiv.style.justifyContent = "space-between";

    let volumeLeft = document.createElement("span");
    volumeLeft.style.marginLeft = "2px";
    volumeLeft.classList.add("oi", "oi-volume-off");

    let volumeRight = document.createElement("span");
    volumeLeft.style.marginRight = "2px";
    volumeRight.classList.add("oi", "oi-volume-high");

    let volumeInput = document.createElement("input");
    volumeInput.setAttribute("type", "range");
    volumeInput.setAttribute("min", "0");
    volumeInput.setAttribute("max", "1");
    volumeInput.setAttribute("step", "0.05");
    volumeInput.style.width = "5.5em";
    volumeInput.value = 0.5;
    volumeInput.setAttribute('data-original-title', volumeInput.value);
    volumeInput.setAttribute("data-toggle", "tooltip");
    volumeInput.setAttribute("data-trigger", "hover");
    volumeInput.classList.add("slider");
    volumeInput.id = "volumeInput-" + lineNum;

    volumeInput.oninput = function () {
        $("#volumeInput-" + lineNum).attr('data-original-title', volumeInput.value).tooltip('update').tooltip('show');
        setVolume(volumeInput, lineNum);
    }

    volumeDiv.appendChild(volumeLeft);
    volumeDiv.appendChild(volumeInput);
    volumeDiv.appendChild(volumeRight);

    let panDiv = document.createElement("div");
    panDiv.style.display = "flex";
    panDiv.style.width = "7em";
    panDiv.style.justifyContent = "space-between";

    let panLeft = document.createElement("p");
    panLeft.style.margin = "0";
    panLeft.style.padding = "0";
    panLeft.innerText = "L";

    let panRight = document.createElement("p");
    panRight.style.margin = "0";
    panRight.style.padding = "0";
    panRight.innerText = "R";

    let panInput = document.createElement("input");
    panInput.setAttribute("type", "range");
    panInput.setAttribute("min", "-1");
    panInput.setAttribute("max", "1");
    panInput.setAttribute("step", "0.1");
    panInput.style.width = "5.5em";
    panInput.value = 0;
    panInput.setAttribute('data-original-title', panInput.value);
    panInput.setAttribute("data-toggle", "tooltip");
    panInput.setAttribute("data-trigger", "hover");
    panInput.classList.add("slider");
    panInput.id = "panInput-" + lineNum;

    panInput.oninput = function () {
        $("#panInput-" + lineNum).attr('data-original-title', panInput.value).tooltip('update').tooltip('show');
        setPan(panInput, lineNum);
    }

    panDiv.appendChild(panLeft);
    panDiv.appendChild(panInput);
    panDiv.appendChild(panRight);

    div.appendChild(p);
    div.appendChild(volumeDiv);
    div.appendChild(panDiv);
    td.appendChild(div);

    return td;
}


function setPanningUnavailable(lineNum) {
    let panInput = document.getElementById("panInput-" + lineNum);
    panInput.setAttribute('disabled', "true");
    $("#panInput-" + lineNum).attr('data-original-title', 'ASDASDS').tooltip('update');
}

function setPan(panInput, lineNum) {
    sounds[soundName[lineNum]].stereo(Number(panInput.value));
}

function setVolume(volumeInput, lineNum) {
    sounds[soundName[lineNum]].volume(volumeInput.value);
}

function createNewLine(title, instName, format) {
    let line = grid.length.valueOf();
    getInstrumentFromServer(instName, false, format);

    sounds[instName].on('load', () => {
        if (sounds[instName]._html5) {
            setPanningUnavailable(line); //Panning is unavailable in howler.js for html5 audio.
        }
    });

    let tr = document.createElement("tr");
    tr.id = "music-" + line;
    let gridLine = new Array(maxBeats);

    tr.appendChild(initialBox(title, line));

    for (let column = 0; column < maxBeats; column++) {
        tr.appendChild(createNewBeat(line, column));
        gridLine[column] = false;
    }
    grid.push(gridLine);
    gridelement.appendChild(tr);

    soundName[line] = instName;
}

function highlightcolumn(column) {
    for (let i = 0; i < grid.length; i++) {
        document.getElementById("music-" + i + "-" + column).parentElement.style.background = "rgba(50, 50, 50, .3)";
    }
}

highlightcolumn(0);

function unhighlightcolumn(column) {
    for (let i = 0; i < grid.length; i++) {
        document.getElementById("music-" + i + "-" + column).parentElement.style.background = "rgba(50, 50, 50, 0)";
    }
}

function clearGrid() {
    for (let line = 0; line < grid.length; line++) {
        for (let column = 0; column < grid[line].length; column++) {
            if (grid[line][column]) {
                toggleSquare(line, column);
            }
        }
    }
}

function toggleSquare(line, column) {
    let div = document.getElementById("music-" + line + "-" + column);
    grid[line][column] = !grid[line][column];

    if (grid[line][column]) {
        div.classList.remove("scale-out-center");
        div.classList.add("scale-in-center");
    } else {
        div.classList.remove("scale-in-center");
        div.classList.add("scale-out-center");
    }
}

function backTo0() {
    unhighlightcolumn(currentBeat);
    currentBeat = 0;
    highlightcolumn(currentBeat);
}

function play() {
    playing = setInterval(mainLoop, 1000 / (beatsPerMinute / 60));
}

function pause() {
    clearInterval(playing);
    playing = null;
}

function mainLoop() {
    unhighlightcolumn(currentBeat);

    currentBeat = (currentBeat + 1) % maxBeats;

    for (let i = 0; i < grid.length; i++) {
        if (grid[i][currentBeat]) {
            sounds[soundName[i]].play();
        }
    }

    highlightcolumn(currentBeat);
}

function getInstrumentFromServer(url, autoplay = false, format = "wav") {
    if (sounds[url] == null || sounds[url].format != format) {
        sounds[url] = new Howl({
            src: url,
            autoplay: autoplay,
            loop: false,
            volume: 0.5,
            format: format,
        });
    } else {
        if (autoplay) {
            sounds[url].play();
        }
    }
}

//Synth Presets

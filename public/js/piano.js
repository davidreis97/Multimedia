/*
* This file contains the code for the MIDI piano input and the Wave display.
*/

/*
-------------------------------
    CONSTANTS AND VARIABLES
-------------------------------
*/

const waveSpeedInput = document.getElementById("waveSpeed");
const waveSizeInput = document.getElementById("waveSize");
const toggleMIDIInput = document.getElementById("toggleMIDIInput");
const MIDIInputSelect = document.getElementById("MIDIInputSelect");
const polyphonic = document.getElementById("polyphonic");
const afterCanvas = document.getElementById("afterCanvas");
const qualityPresets = document.getElementById("qualityPresets");
const speedMultiplier = document.getElementById("speedMultiplier");
const sizeMultiplier = document.getElementById("sizeMultiplier");
const maxWaves = document.getElementById("maxWaves");
let midiEnabled = false;

/*
-----------------------
    HTML COMPONENTS
-----------------------
*/

maxWaves.oninput = () => {
  for(wave of waves){
    wave.clearWave();
  }

  waves = [];

  for(let i = maxWaves.value; i > 0; i--){
    waves.push(new MyWave(0,0,0));
  }
}

waveSpeedInput.oninput = () => {
  speedMultiplier.innerText = "x" + Number(waveSpeedInput.value).toFixed(2);
}

waveSizeInput.oninput = () => {
  maxAmplitude = waveSizeInput.value * defaultAmplitude;
  resizeCanvas(window.innerWidth, 2*maxAmplitude);
  afterCanvas.style.marginTop = -maxAmplitude + "px";
  sizeMultiplier.innerText = "x" + Number(waveSizeInput.value).toFixed(2);;
}

qualityPresets.oninput = () => {
  switch(qualityPresets.value){
      case "1": 
          {
              frameRateValue = 30;
              accuracy = 7;
              break;
          }
      case "2":
          {
              frameRateValue = 50;
              accuracy = 5;
              break;
          }
      case "3":
          {
              frameRateValue = 55;
              accuracy = 4;
              break;
          }
      case "4":
          {
              frameRateValue = 60;
              accuracy = 3;
              break;
          }
      case "5":
          {
              frameRateValue = 70;
              accuracy = 1;
              break;
          }
  }

  strokeWeight(accuracy);
  frameRate(frameRateValue);
}

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
        this.freq = 0;
        this.amplitude = 0;
        this.speed = 0;
        this.angle = angle;
        this.oldAngle = angle;

        this.nextFreq = freq;
        this.nextAmplitude = amplitude;
        this.nextSpeed = speed;

        this.note = "";

        window.setInterval(()=>{this.checkChanges(this)},lerpSpeed);
    }

    clearWave(){
        this.setFreq(0);
        this.setAmplitude(0);
        this.setSpeed(0);
        this.note = "";
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
    new MyWave(0,0,0),
    new MyWave(0,0,0),
    new MyWave(0,0,0),
    new MyWave(0,0,0),
    /*new MyWave(0,0,0),
    new MyWave(0,0,0),
    new MyWave(0,0,0),
    new MyWave(0,0,0),
    new MyWave(0,0,0),*/
]

let angle = 0;
const defaultAmplitude = 80.0;
let maxAmplitude = defaultAmplitude;
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
            wave.angle += -wave.speed * waveSpeedInput.value / 100 * 60 / frameRateValue;
            if (wave.angle >= TWO_PI){
                wave.angle = 0;
            }
        }
    }
}


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

function getFreeWave() {
    for(let wave of waves){
        if(wave.nextSpeed == 0 && wave.nextAmplitude == 0 && wave.nextFreq == 0 && wave.note == ""){
            return wave;
        }
    }

    return null;
}

function getWaveByNote(note){
    for(let wave of waves){
        if(wave.note == note){
            return wave;
        }
    }

    return null;
}

MIDIInputSelect.oninput = (evt) => {
    if(MIDIInputSelect.value != 0){
        let midiInput = WebMidi.getInputById(MIDIInputSelect.value);

        if (midiInput){
            midiInput.addListener("noteon","all",(evt) => {
                currentNote = evt.note.name + "" + evt.note.octave;
                if(polyphonic.checked){
                    synth.triggerAttack(currentNote);

                    let wave = getFreeWave();
                    if (wave) {
                        wave.setFreq(new Tone.Frequency(currentNote)/10);
                        wave.setAmplitude(evt.velocity);
                        wave.setSpeed((Math.random() * 2) - 1);
                        wave.note = currentNote;
                    }
                }else{
                    synth.triggerAttack(currentNote,null,evt.velocity);
                    
                    waves[0].setFreq(new Tone.Frequency(currentNote)/10);
                    waves[0].setAmplitude(evt.velocity);
                    waves[0].setSpeed((Math.random() * 2) - 1);
                    waves[0].note = currentNote;
                }

                
            });

            midiInput.addListener("noteoff","all",(evt) => {
                if(polyphonic.checked){
                    synth.triggerRelease(evt.note.name + "" + evt.note.octave); //Polyphonic

                    let wave = getWaveByNote(evt.note.name + "" + evt.note.octave);
                    if(wave){
                        wave.clearWave();
                    }else{
                        console.log("Warning missing note " + evt.note.name + "" + evt.note.octave);
                    }
                }else{
                    if (evt.note.name + "" + evt.note.octave == currentNote){
                        synth.triggerRelease(); //Monophonic
                        waves[0].clearWave();
                    }
                }

                
            });

            console.log("Successfully listening to midi input with id [" + MIDIInputSelect.value +"]");
        }else{
            console.log("Could not get midi input with id [" + MIDIInputSelect.value + "]");
        }
    }
}

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
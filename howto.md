# Music Grid

The music grid is a place where you can compose your own beats, using sounds from our library or any sound in the web, supporting a wide range of audio formats (wav, mp3, mp4, webm, opus, ogg, oga, aac, caf, m4a, weba, dolby and flac).

To get started, start by placing a few beats on the grid, by clicking on a few empty squares. Each grid line corresponds to an instrument, and each column corresponds to a beat. Once you press play, the website will start looping over the grid, playing the sounds as you placed them across the grid.

## Control Bar

The control bar allows you to control the music grid's behaviour. It features a play/pause button, allows you to change the number of columns in the grid, change the speed of the loop (in Beats Per Minute), clear the entire grid and collapse the grid (useful for displaying the wave in a bigger size).

## Adding a new Instrument

To add a new instrument, press the "+ New Instrument" button in the button bar below the grid. A modal will pop up, where you can provide the details of the instrument you wish to add to the grid.

We offer you a small library of instruments from which you can choose. By pressing "Toggle Library" you will be able to see all the instruments that we offer on a table. By clicking one of the items in the table, the url, name and filetype of the chosen sound will be automatically filled, and you can just press "Add Instrument" to add it to the music grid. Note that you may have to scroll down the music grid in order to see the instrument that you just added.

Alternatively, you can also link your own audio files from anywhere on the Internet. Make sure to select the correct format for your audio source.

# Midi Piano and Wave

Our website also allows you to play a synth via MIDI input. You'll also be able to see the soundwave according to what you're playing in real time. The next steps will help you configure your MIDI device.

## Configuring MIDI Input

Make sure that your MIDI Input device is connected to your computer. Then, press the "Configure MIDI Input" button on the button bar below the music grid. A modal will pop up allowing you to enable the MIDI Input. After you enable the MIDI input, you can choose from the dropdown list the input device that you wish to use on the website. For your convenience, the name of the MIDI device as well as it's manufacturer will be displayed. This is useful in case you have more than one MIDI devices connected to your computer. On the checkbox below the dropdown, you can also choose between a polyphonic synthesizer and a monophonic synthesizer. The polyphonic will play more than one note at a time, while the monophonic one can only play one note at a time.

## Wave

As you play, a green animated wave will be rendered below the music grid according to the MIDI input that is received from the MIDI device. The wave is the sum of all the waves from each note that you play at the same time. This means that if you play a single note then you'll see a perfect sine wave (sinusoid). If you play more than a single note, then the waves will mix and you'll see different types of waves according to the combination of keys and intervals that you play. Note that by default each sine wave has a speed in order to produce a visually more appealing effect. This can be disabled in the settings, as described below.

### Configuring the wave

If you press the "Wave Settings" button bellow the grid, at the right of the screen, you'll see a pop up where you can change the wave speed, size, render quality and maximum sine waves.

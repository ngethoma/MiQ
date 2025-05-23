const COLORS = {
  bgStart: '#1e1e2f',
  bgEnd:   '#0e0e1f',
  accent:  '#26c6da',
  button:  '#37474f',
  hover:   '#455a64',
  text:    '#eceff1',
  keyDefault: '#eceff1',
  correct: '#66bb6a',
  wrong:   '#ef5350'
};

let numDivisions;
let frequencies = [];
let targetChord = [];
let userChord = [];
let keyboard = [];
let keyWidth;

let isPlaying = false;
let isSubmitted = false;
let showCorrectChord = false;

let practiceMode = false;
let waveformSelect;
let waveforms = ['sine'];

let tuningSlider, octaveSelect, presetButtons = [];


let message = '';
let gameStarted = false;
let mode = '';
let state = 'title';
let difficulty = 'normal';

let practicePressedKey = null;
let practicePressedKeys = new Set();


let score = 0;
let correctCount = 0;
let wrongCount = 0;
let questionCount = 0;
const maxQuestions = 10;

let resultStartTime = 0;
const resultDelay = 500; 

const keyMap = '1234567890qwertyuiopasdfghjklzxcvbnm';

function setup() {
  createCanvas(800, 500);
  textFont('Helvetica');
  noLoop();
}

function draw() {
  if (state === 'practice') {
    drawPractice();
    return;
  }

  setGradient(0, 0, width, height, COLORS.bgStart, COLORS.bgEnd);
  fill(COLORS.text);
  textAlign(CENTER, CENTER);

  if (state === 'title') drawTitle();
  else if (state === 'select') drawSelect();
  else if (state === 'play') drawPlay();
  else if (state === 'result') drawResult();
}


function drawTitle() {
  background(COLORS.bgStart);
  textSize(48);
  fill(COLORS.accent);
  text('Microtonal Chord Guesser', width/2, height/2 - 40);
  textSize(20);
  fill(COLORS.text);
  text('Press ENTER to Start', width/2, height/2 + 40);

  drawStyledButton(20, height - 50, 100, 30, 'Home');
}


function drawSelect() {
  background(COLORS.bgStart);
  textSize(36);
  fill(COLORS.text);
  text('Select Mode', width / 2, height / 2 - 160);

  const diffW = 120, diffH = 36, diffS = 20;
  const diffX = width/2 - (diffW * 4 + diffS * 3) / 2;
  textSize(16);
  text('Difficulty:', width / 2 - 260, height / 2 - 90);

  drawStyledButton(diffX, height / 2 - 70, diffW, diffH, 'Normal', difficulty === 'normal');
  drawStyledButton(diffX + (diffW + diffS), height / 2 - 70, diffW, diffH, 'Hard', difficulty === 'hard');
  drawStyledButton(diffX + 2 * (diffW + diffS), height / 2 - 70, diffW, diffH, 'Extreme', difficulty === 'extreme');
  drawStyledButton(diffX + 3 * (diffW + diffS), height / 2 - 70, diffW, diffH, 'Infinite', difficulty === 'infinite');

  const modeW = 140, modeH = 40, modeS = 20;
  const modeX = width / 2 - (modeW * 2 + modeS) / 2;
  
  text('GameMode:', width / 2 - 248, height / 2 + 0);

  drawStyledButton(modeX, height / 2 + 10, modeW, modeH, 'Endless', mode === 'endless');
  drawStyledButton(modeX + modeW + modeS, height / 2 + 10 , modeW, modeH, '10Q Mode', mode === '10q');

  drawStyledButton(
    width / 2 - 60, height / 2 + 100, 120, 36,
    mode !== '' ? 'Start' : 'Select Mode',
    false
  );
  
  drawStyledButton(width/2 +220 , height/2 +170 , 120, 36, 'Practice');
  
}


function drawPlay() {
  textSize(25);
  fill(COLORS.text);
  text(`EDO: ${numDivisions}`, width/2, 90);
  text(`Score: ${score}`, width/2, 120);
  text(`Q${questionCount+1}`, width/2, 60);
  
  if (!isPlaying) {
    textSize(22);
    text('Which notes?', width/2, height/2 - 60);
    //text('Enter: Submit', width/2, height/2 - 70);
  }

  drawKeyboard();

  if (message) {
    fill(COLORS.text);
    textSize(22);
    text(message, width/2, height/2 - 20 );
  }

  if (mode === 'endless') {
    drawStyledButton(width - 150, 20, 120, 30, 'Oaiso');
  }

  if (gameStarted && !isPlaying) {
    drawStyledButton(width - 150, height - 40, 120, 30, 'Submit');
  }
}


function drawResult() {
  background(COLORS.bgStart);
  textSize(32);
  fill(COLORS.accent);
  text('Result', width/2, height/2 - 160);

  textSize(20);
  fill(COLORS.text);
  text(`Difficulty: ${difficulty.toUpperCase()}`, width/2, height/2 - 110);

  drawStyledButton(width/2 - 60, height/2 + 110, 120, 36, 'Title');

  const total = correctCount + wrongCount;
  const acc   = total > 0 ? ((correctCount / total) * 100).toFixed(1) : '0.0';
  let rating  = '-';
  if (total >= 5) {
    const thresholds = [100,95,90,80,70,50,25,10,5,0];
    const labels     = ['SSS','SS','S','A','B','C','D','E','F','G'];
    for (let i = 0; i < thresholds.length; i++) {
      if (Number(acc) >= thresholds[i]) { rating = labels[i]; break; }
    }
  }
  const items = [
    `Score: ${score}`,
    `Correct: ${correctCount}`,
    `Wrong: ${wrongCount}`,
    `Accuracy: ${acc}%`,
    `Rating: ${rating}`
  ];

  textSize(24);
  fill(COLORS.text);
  const baseY = height/2 - 60;
  const spacing = 30;
  for (let i = 0; i < items.length; i++) {
    if (millis() - resultStartTime >= (i + 1) * 600) {
      text(items[i], width/2, baseY + i * spacing);
    }
  }
 drawStyledButton(width - 90, height - 50, 60, 30, '𝕏');
}

function mousePressed() {
  if (state === 'title') {
  if (mouseOverButton(20, height - 50, 100, 30)) {
    window.open('http://ngethoma.com', '_blank');
    return;
  }

  state = 'select';
  redraw();
  return;
}


  if (state === 'select') {
    const diffW = 120, diffH = 36, diffS = 20;
    const diffY = height / 2 - 70;
    const diffX = width / 2 - (diffW * 4 + diffS * 3) / 2;

    if (mouseOverButton(diffX, diffY, diffW, diffH)) difficulty = 'normal';
    if (mouseOverButton(diffX + diffW + diffS, diffY, diffW, diffH)) difficulty = 'hard';
    if (mouseOverButton(diffX + 2 * (diffW + diffS), diffY, diffW, diffH)) difficulty = 'extreme';
    if (mouseOverButton(diffX + 3 * (diffW + diffS), diffY, diffW, diffH)) difficulty = 'infinite';

    const modeW = 140, modeH = 40, modeS = 20;
    const modeY = height / 2 + 10 ;
    const modeX = width / 2 - (modeW * 2 + modeS) / 2;

    if (mouseOverButton(modeX, modeY, modeW, modeH)) mode = 'endless';
    if (mouseOverButton(modeX + modeW + modeS, modeY, modeW, modeH)) mode = '10q';

    if (mouseOverButton(width / 2 - 60, height / 2 + 100, 120, 36) && mode !== '') {
      selectMode(mode);
      return;
    }
    
    if (mouseOverButton(width/2 + 220, height/2 + 170, 120, 36)) {
      state = 'practice';
      updateFrequencies();
      redraw();
      return;
}

    redraw();
    return;
  }

  if (state === 'play') {
  if (mode === 'endless' && mouseOverButton(width - 150, 20, 120, 30)) {
    enterResult('endless');
    return;
  }

  if (gameStarted && !isPlaying && mouseOverButton(width - 150, height - 40, 120, 30)) {
    checkAnswer();
    return;
  }

  if (gameStarted && !isPlaying && mouseY > height - 150 && mouseY < height - 50) {
    const idx = floor((mouseX - 50) / keyWidth);
    if (idx >= 0 && idx < frequencies.length) {
      if (userChord.includes(idx)) {
        userChord = userChord.filter(i => i !== idx);
        keyboard[idx] = false;
      } else {
        userChord.push(idx);
        keyboard[idx] = true;
      }
      redraw();
    }
  }
}


  if (state === 'result') {
  if (mouseOverButton(width/2 - 60, height/2 + 120, 120, 36)) {
    resetGame();
    state = 'title';
    redraw();
    return;
  }

  if (mouseOverButton(width - 90, height - 50, 60, 30)) {
    const total = correctCount + wrongCount;
    const acc = total > 0 ? ((correctCount / total) * 100).toFixed(1) : '0.0';
    const rating = (() => {
      const thresholds = [100,95,90,80,70,50,25,10,5,0];
      const labels     = ['SSS','SS','S','A','B','C','D','E','F','G'];
      for (let i = 0; i < thresholds.length; i++) {
        if (Number(acc) >= thresholds[i]) return labels[i];
      }
      return '-';
    })();

    const tweet = `Microtonal Chord Guesser \n`
                + `Mode: ${mode.toUpperCase()}\n`
                + `Difficulty: ${difficulty.toUpperCase()}\n`
                + `Score: ${score} / Accuracy: ${acc}%\n`
                + `Rating: ${rating}\n`
                + `#Microtonal_Chord_Guesser https://ngethoma.github.io/MiQ/`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(tweetUrl, '_blank');
    return;
  }
}

  
if (state === 'practice') {
  if (mouseOverButton(width - 150, 20, 120, 30)) {
    resetGame();
    state = 'title';
    redraw();
    return;
  }

  const keyHeight = 100;
  const y = height - 150;

  if (mouseY >= y && mouseY <= y + keyHeight) {
    const totalWidth = frequencies.length * keyWidth;
    const startX = (width - totalWidth) / 2;
    const idx = floor((mouseX - startX) / keyWidth);

    if (idx >= 0 && idx < frequencies.length) {
      practicePressedKeys.add(idx);  
      playTone(frequencies[idx], 0.5);
      redraw();
    }
  }
  return;
}



}

function mouseReleased() {
  if (state === 'practice') {
    practicePressedKeys.clear();  
    redraw();
  }
}




function keyPressed() {
  if (state === 'select') {
    if (key === 'e') enterResult('endless');
    if (key === 't') enterResult('10q');
    if (key === 'n') difficulty = 'normal';
    if (key === 'h') difficulty = 'hard';
    if (key === 'x') difficulty = 'extreme';
    if (key === 'i') difficulty = 'infinite';
    redraw();
    return;
  }

  if (state === 'title') {
    if (key === 'Enter') {
      state = 'select';
      redraw();
    } else if (key === 'p') {
      state = 'practice';
      updateFrequencies();
      redraw();
    }
    return;
  }

  if (state === 'practice') {
  let idx = keyMap.indexOf(key);
  if (idx !== -1 && idx < frequencies.length) {
    playTone(frequencies[idx], 0.5);
    practicePressedKeys.add(idx);  
    redraw();
  }
  return;
}



  if (state === 'play') {
    if (!gameStarted && key === 'Enter') {
      gameStarted = true;
      setupNewRound();
    } else if (gameStarted && key === 'Enter' && !isPlaying) {
      checkAnswer();
    } else if (gameStarted && key === 'Escape') {
      resetGame(); state = 'title'; redraw();
    } else {
      const idx = keyMap.indexOf(key);
      if (idx !== -1 && idx < frequencies.length) {
        if (userChord.includes(idx)) {
          userChord = userChord.filter(i => i !== idx);
          keyboard[idx] = false;
        } else {
          userChord.push(idx);
          keyboard[idx] = true;
        }
        redraw();
      }
    }
    return;
  }

  if (state === 'result' && key === 'r') {
    resetGame(); state = 'title'; redraw();
    return;
  }
}

function keyReleased() {
  if (state === 'practice') {
    for (let i = 0; i < keyMap.length; i++) {
      const k = keyMap[i];
      if (!keyIsDown(k)) {
        practicePressedKeys.delete(i);
      }
    }
    redraw();
  }
}





function selectMode(m) {
  mode = m;
  state = 'play';
  gameStarted = true;
  setTimeout(() => { setupNewRound(); redraw(); }, 50);
  redraw();
}

function enterResult(selectedMode) {
  mode = selectedMode;
  gameEnded = true;
  state = 'result';
  resultStartTime = millis();
  loop();
  redraw();
}

function setupNewRound() {
  if (difficulty === 'infinite') {
    numDivisions = int(random(13, 73)); 
  } else {
    numDivisions = int(random(2, 36));
  }
  keyWidth = (width - 100) / (numDivisions + 1);

  frequencies = [];
  keyboard = [];
  userChord = [];
  message = '';
  showCorrectChord = false;
  isSubmitted = false;
  isPlaying = true;

  const baseFreq = 261.63;
  for (let i = 0; i <= numDivisions; i++) {
    frequencies.push(baseFreq * pow(2, i / numDivisions));
    keyboard.push(false);
  }

  if (difficulty === 'infinite') {
    generateTargetChord(); 
  } else {
    playGlissando(() => generateTargetChord());
  }
}


function playGlissando(callback) {
  let i = 0;
  function next() {
    if (i < frequencies.length) {
      keyboard[i] = true; redraw();
      playTone(frequencies[i], 0.2);
      setTimeout(() => {
        keyboard[i] = false; redraw();
        i++;
        next();
      }, 220);
    } else if (callback) {
      callback();
    }
  }
  next();
}

function generateTargetChord() {
  targetChord = [];

  let minN = difficulty === 'normal' ? 2 :
             difficulty === 'hard' ? 3 :
             difficulty === 'extreme' ? 6 : 3;
  let maxN = difficulty === 'normal' ? 3 :
             difficulty === 'hard' ? 6 :
             difficulty === 'extreme' ? 10 : 10;

  minN = min(minN, frequencies.length);
  maxN = min(maxN, frequencies.length);

  const count = int(random(minN, maxN + 1));
  while (targetChord.length < count) {
    const idx = int(random(frequencies.length));
    if (!targetChord.includes(idx)) targetChord.push(idx);
  }

  setTimeout(() => {
    playChord(targetChord);
    isPlaying = false;
    redraw();
  }, 300);
}


function playChord(chord) {
  chord.forEach(idx => playTone(frequencies[idx], 0.5));
}

function playTone(freq, dur) {
  const wave = waveforms && waveforms[0] ? waveforms[0] : 'sine';
  const osc = new p5.Oscillator(wave);
  osc.freq(freq);
  osc.amp(0);
  osc.start();
  osc.amp(0.4, 0.01);
  setTimeout(() => {
    osc.amp(0, 0.03);
    setTimeout(() => osc.stop(), 100);
  }, dur * 1000);
}


function checkAnswer() {
  if (isSubmitted) return;
  isSubmitted = true;

  userChord.sort((a, b) => a - b);
  targetChord.sort((a, b) => a - b);

  const correct = JSON.stringify(userChord) === JSON.stringify(targetChord);
  message = correct ? 'Correct!' : 'Wrong';
  if (correct) correctCount++;
  else wrongCount++;
  if (correct) score++;

  showCorrectChord = true;
  playChord(targetChord);
  redraw();

  setTimeout(() => {
    if (mode === '10q' && questionCount + 1 >= maxQuestions) {
      enterResult('10q');
    } else {
      questionCount++;
      setupNewRound();
    }
  }, 2000);
}

function resetGame() {
  state = 'title';
  mode = '';
  gameStarted = false;
  gameEnded = false;
  score = correctCount = wrongCount = questionCount = 0;
  message = '';
  targetChord = [];
  userChord = [];
  keyboard = [];
  frequencies = [];

  if (tuningSlider) { tuningSlider.remove(); tuningSlider = null; }
  if (octaveSelect) { octaveSelect.remove(); octaveSelect = null; }
  if (waveformSelect) { waveformSelect.remove(); waveformSelect = null; }

  noLoop();
}




function drawKeyboard() {
  if (!frequencies.length) return;

  keyWidth = (width - 100) / frequencies.length;
  const totalWidth = frequencies.length * keyWidth;
  const startX = (width - totalWidth) / 2;
  const y = height - 150;

  for (let i = 0; i < frequencies.length; i++) {
    const x = startX + i * keyWidth;

    if (state === 'practice' && practicePressedKeys.has(i)) {
  fill('#888'); 
}
 else if (showCorrectChord && targetChord.includes(i)) {
      fill(userChord.includes(i) ? COLORS.correct : COLORS.wrong);
    } else {
      fill(keyboard[i] ? COLORS.accent : COLORS.keyDefault);
    }

    stroke(COLORS.hover);
    rect(x, y, keyWidth, 100, 6);
    noStroke();
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(keyMap[i] || '', x + keyWidth / 2, y + 50);
  }
}



function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    const t = map(i, y, y + h, 0, 1);
    stroke(lerpColor(color(c1), color(c2), t));
    line(x, i, x + w, i);
  }
}

function drawStyledButton(x, y, w, h, label, selected = false) {
  noStroke();
  fill(selected ? COLORS.accent : COLORS.button);
  rect(x, y, w, h, 8);
  
  fill(COLORS.text);
  textSize(16);
  textAlign(CENTER, CENTER); 
  text(label, x + w / 2, y + h / 2);  
}


function mouseOverButton(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}





function drawPractice() {
  background(COLORS.bgStart);
  fill(COLORS.text);
  textAlign(LEFT, TOP);
  textSize(18);
  text('Practice Mode', 20, 20);

  if (!tuningSlider) {
    tuningSlider = createSlider(2, 72, 12, 1);
    tuningSlider.position(20, 60);
    tuningSlider.input(updateFrequencies);
  }

  if (!octaveSelect) {
    octaveSelect = createSelect();
    octaveSelect.position(20, 100);
    for (let i = 1; i <= 10; i++) octaveSelect.option(`${i}`, i);
    octaveSelect.selected("4");
    octaveSelect.changed(updateFrequencies);
  }

  if (!waveformSelect) {
  waveformSelect = createSelect();
  waveformSelect.position(20, 140);
  ['sine', 'triangle', 'square', 'sawtooth'].forEach(w => waveformSelect.option(w));
  waveformSelect.selected('sine');
  waveformSelect.changed(updateWaveform); 
}

  
    fill(COLORS.text);
  textSize(14);
  text(`EDO: ${tuningSlider.value()}`, 160, 65);
  text(`Octave`, 160, 105);
  text(`Waveform`, 160, 145);

  drawStyledButton(width - 150, 20, 120, 30, 'Title');


  if (frequencies.length === 0) {
    updateFrequencies();  
  }

  drawKeyboard();
}





function updateFrequencies() {
  const div = tuningSlider?.value() || 12;
  const oct = parseInt(octaveSelect?.value() || "4");
  const base = 523.25 / Math.pow(2, 5 - oct);  


  frequencies = [];
  for (let i = 0; i <= div; i++) {
    frequencies.push(base * Math.pow(2, i / div));
  }

  keyboard = new Array(frequencies.length).fill(false);
  keyWidth = (width - 100) / (frequencies.length + 1);

  redraw();
}

function updateWaveform() {
  waveforms = [waveformSelect.value()];
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}


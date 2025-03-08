// Word bank (unchanged—75+ words per level + longest word)
const wordBank = {
    1: ["ship", "moon", "star", "mars", "crew", "jump", "fast", "glow", "dark", "wind", "blue", "rock", "dust", "beam", "void", "bolt", "gear", "fuel", "helm", "scan", "zone", "peak", "dash", "lift", "path", "core", "node", "link", "wave", "flux", "play", "time", "loop", "code", "data", "byte", "chip", "wire", "port", "disk", "grid", "cell", "mode", "test", "form", "line", "type", "move", "step", "base", "fire", "heat", "cold", "snow", "rain", "tree", "leaf", "root", "stem", "bark", "seed", "grow", "flow", "drop", "rise", "fall", "push", "pull", "spin", "turn", "lock", "key", "gate", "wall", "door"],
    2: ["rocket", "planet", "orbit", "space", "alien", "comet", "lunar", "solar", "asteroid", "nebula", "thrust", "engine", "cosmic", "galaxy", "probe", "radar", "signal", "launch", "drift", "vapor", "pulse", "field", "gauge", "laser", "panel", "cargo", "droid", "scope", "track", "boost", "relay", "system", "array", "logic", "input", "cache", "stack", "frame", "pixel", "block", "shift", "query", "layer", "route", "debug", "patch", "build", "cycle", "power", "charge", "spark", "light", "sound", "echo", "vibe", "tone", "beat", "rhythm", "melody", "chord", "note", "song", "dance", "step", "leap", "bound", "glide", "float", "sink", "swim", "dive", "climb", "reach", "touch"],
    3: ["gravity", "astronaut", "propulsion", "telescope", "satellite", "velocity", "spectrum", "radiation", "magnetic", "trajectory", "terminal", "protocol", "interface", "compiler", "algorithm", "processor", "bandwidth", "encryption", "firewall", "database", "navigation", "calibration", "simulation", "telemetry", "distortion", "frequency", "amplifier", "conductor", "resistance", "capacitor", "transistor", "oscillator", "generator", "modulator", "integrator", "differentiator", "stabilizer", "accelerator", "configurator", "synchronizer", "optimizer", "virtualization", "authentication", "compression", "decompression", "replication", "partition", "fragmentation", "aggregation", "resolution", "simulation", "projection", "analysis", "synthesis", "extraction", "transformation", "integration", "validation", "verification", "optimization", "correlation", "distribution", "interpolation", "extrapolation", "quantization", "normalization", "standardization", "visualization"],
    4: ["pneumonoultramicroscopicsilicovolcanoconiosis"]
  };
  
  let currentLevel = 1;
  let score = 0;
  let highScore = localStorage.getItem("highScore") || 0;
  let timeLeft = 15; // Increased from 10s
  let startTime = null;
  let timerInterval = null;
  let gameActive = false;
  let streak = 0;
  let totalWords = 0;
  let correctWords = 0;
  let errors = 0;
  
  const wordDisplay = document.getElementById("wordDisplay");
  const input = document.getElementById("input");
  const scoreDisplay = document.getElementById("score");
  const highScoreDisplay = document.getElementById("highScore");
  const wpmDisplay = document.getElementById("wpm");
  const accuracyDisplay = document.getElementById("accuracy");
  const errorsDisplay = document.getElementById("errors");
  const rankDisplay = document.getElementById("rank");
  const timeDisplay = document.getElementById("timeLeft");
  const levelDisplay = document.getElementById("levelNum");
  const streakDisplay = document.getElementById("streak");
  const feedback = document.getElementById("feedback");
  const progress = document.getElementById("progress");
  const pointPop = document.getElementById("pointPop");
  const restartButton = document.getElementById("restart");
  
  highScoreDisplay.textContent = highScore;
  
  // World typist ranks (unchanged)
  const ranks = [
    { name: "Beginner", minWPM: 0 },
    { name: "Amateur", minWPM: 40 },
    { name: "Pro", minWPM: 70 },
    { name: "Expert", minWPM: 100 },
    { name: "Master", minWPM: 120 },
    { name: "Elite", minWPM: 150 },
    { name: "Cosmic Legend", minWPM: 200 }
  ];
  
  // Start game
  wordDisplay.addEventListener("click", startGame);
  
  // Check input
  input.addEventListener("input", () => {
    if (!gameActive) return;
    const typed = input.value.trim();
    const target = wordDisplay.textContent;
    totalWords++;
  
    if (typed === target) {
      const points = currentLevel === 4 ? 100 : currentLevel * 5 + (streak >= 5 ? 5 : 0);
      score += points;
      correctWords++;
      streak++;
      timeLeft += currentLevel === 4 ? 0 : 2; // +2s per word, except Level 4
      timeDisplay.textContent = timeLeft;
      streakDisplay.textContent = streak;
      feedback.textContent = currentLevel === 4 ? "Cosmic Victory!" : "Repaired!";
      feedback.style.color = "#00ff00";
      showPointPop(`+${points}`);
      updateStats();
      newWord();
      flashProgress();
    } else if (target.startsWith(typed)) {
      feedback.textContent = "Typing...";
      feedback.style.color = "#fff";
    } else {
      errors++;
      streak = 0;
      streakDisplay.textContent = streak;
      feedback.textContent = "Error!";
      feedback.style.color = "#ff0000";
      errorsDisplay.textContent = errors;
    }
  });
  
  // New word
  function newWord() {
    const words = wordBank[currentLevel];
    const randomIndex = Math.floor(Math.random() * words.length);
    wordDisplay.textContent = words[randomIndex];
    input.value = "";
    updateProgress();
    if (score >= 50 && currentLevel < 2) levelUp(2);
    else if (score >= 100 && currentLevel < 3) levelUp(3);
    else if (score >= 150 && currentLevel < 4) levelUp(4);
  }
  
  // Level up
  function levelUp(newLevel) {
    currentLevel = newLevel;
    levelDisplay.textContent = currentLevel;
    timeLeft = currentLevel === 4 ? 30 : timeLeft + 10; // 30s for longest word, +10s otherwise
    timeDisplay.textContent = timeLeft;
    feedback.textContent = currentLevel === 4 ? "Final Challenge: Type the Longest Word!" : `Level ${newLevel} - Faster!`;
    progress.style.background = currentLevel === 2 ? "#ff007a" : currentLevel === 3 ? "#ffcc00" : currentLevel === 4 ? "#00ff00" : "#00ffcc";
  }
  
  // Timer
  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }
  
  // Stats update with ranking
  function updateStats() {
    scoreDisplay.textContent = score;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wpm = Math.round(correctWords / timeElapsed) || 0;
    wpmDisplay.textContent = wpm;
    const accuracy = Math.round((correctWords / totalWords) * 100) || 100;
    accuracyDisplay.textContent = accuracy;
  
    // Update rank
    let currentRank = "Unranked";
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (wpm >= ranks[i].minWPM) {
        currentRank = ranks[i].name;
        break;
      }
    }
    rankDisplay.textContent = currentRank;
  }
  
  // Progress bar flash
  function flashProgress() {
    progress.classList.add("flash");
    setTimeout(() => progress.classList.remove("flash"), 300);
  }
  
  // Point pop-up
  function showPointPop(points) {
    pointPop.textContent = points;
    pointPop.style.opacity = 1;
    setTimeout(() => pointPop.style.opacity = 0, 500);
  }
  
  // Progress bar update
  function updateProgress() {
    const progressPercent = Math.min((score / 200) * 100, 100);
    progress.style.width = `${progressPercent}%`;
  }
  
  // Start game
  function startGame() {
    if (gameActive) return;
    gameActive = true;
    input.disabled = false;
    input.focus();
    score = 0;
    timeLeft = 15; // Increased from 10s
    streak = 0;
    totalWords = 0;
    correctWords = 0;
    errors = 0;
    startTime = Date.now();
    scoreDisplay.textContent = score;
    wpmDisplay.textContent = 0;
    accuracyDisplay.textContent = 100;
    errorsDisplay.textContent = 0;
    rankDisplay.textContent = "Unranked";
    streakDisplay.textContent = 0;
    timeDisplay.textContent = timeLeft;
    levelDisplay.textContent = currentLevel;
    progress.style.width = "0%";
    progress.style.background = "#00ffcc";
    restartButton.style.display = "none";
    feedback.textContent = "";
    newWord();
    startTimer();
  }
  
  // End game
  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    input.disabled = true;
    wordDisplay.textContent = "Mission Over!";
    feedback.textContent = `Rank: ${rankDisplay.textContent} | WPM: ${wpmDisplay.textContent}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreDisplay.textContent = highScore;
    }
    restartButton.style.display = "block";
  }
  
  // Restart
  restartButton.addEventListener("click", startGame);
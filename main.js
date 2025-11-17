// Punto de entrada del juego
import { Loader } from './engine/loader.js';
import { StateManager } from './engine/stateManager.js';
import { AudioManager } from './engine/audioManager.js';
import { ArcadeGame } from './game/arcade.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Elementos UI
const menuScreen = document.getElementById('menu');
const controlsScreen = document.getElementById('controls');
const pauseScreen = document.getElementById('pause');
const gameoverScreen = document.getElementById('gameover');
const loadingScreen = document.getElementById('loading');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');
const finalScoreDisplay = document.getElementById('final-score');

// Sistema de carga y audio
const loader = new Loader();
const audioManager = new AudioManager(loader);
const stateManager = new StateManager();
let game = null;
let keys = {};
let lastTime = 0;

// Cargar recursos
function loadAssets() {
    // Cargar imágenes
    loader.loadImage('player', './assets/images/player.png');
    loader.loadImage('enemy-basic', './assets/images/enemy-basic.png');
    loader.loadImage('enemy-strong', './assets/images/enemy-strong.png');
    loader.loadImage('enemy-elite', './assets/images/enemy-elite.png');
    loader.loadImage('bullet', './assets/images/bullet.png');
    loader.loadImage('background', './assets/images/background.jpg');
    
    // Cargar audio
    loader.loadAudio('shoot', './assets/audio/shoot.wav');
    loader.loadAudio('explosion', './assets/audio/explosion.wav');
    loader.loadAudio('enemy-hit', './assets/audio/enemy-hit.wav');
    loader.loadAudio('level-complete', './assets/audio/level-complete.mp3');
    loader.loadAudio('game-over', './assets/audio/game-over.wav');
    loader.loadAudio('background-music', './assets/audio/background-music.mp3');
}

// Inicializar juego
function initGame() {
    game = new ArcadeGame(canvas, audioManager);
    game.setLoader(loader);
    game.init();
    
    // Configurar estados
    stateManager.addState('menu', {
        onEnter: () => showScreen('menu'),
        onExit: () => hideScreen('menu')
    });
    
    stateManager.addState('playing', {
        onEnter: () => {
            hideScreen('menu');
            hideScreen('pause');
            hideScreen('gameover');
        },
        update: (dt) => {
            if (game) {
                game.update(dt);
                updateUI();
                
                if (game.getGameState().gameOver) {
                    stateManager.setState('gameover');
                }
            }
        },
        render: () => {
            if (game) {
                game.render();
            }
        }
    });
    
    stateManager.addState('paused', {
        onEnter: () => showScreen('pause'),
        onExit: () => hideScreen('pause')
    });
    
    stateManager.addState('gameover', {
        onEnter: () => {
            if (game) {
                finalScoreDisplay.textContent = `Puntuación final: ${game.getGameState().score}`;
            }
            showScreen('gameover');
        },
        onExit: () => hideScreen('gameover')
    });
    
    stateManager.setState('menu');
}

// Actualizar UI
function updateUI() {
    if (game) {
        const state = game.getGameState();
        scoreDisplay.textContent = `Puntuación: ${state.score}`;
        livesDisplay.textContent = `Vidas: ${state.lives}`;
        levelDisplay.textContent = `Nivel: ${state.level}`;
    }
}

// Mostrar/ocultar pantallas
function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('active');
    }
}

// Event listeners
function setupEventListeners() {
    // Botones del menú
    const startBtn = document.getElementById('start-btn');
    const controlsBtn = document.getElementById('controls-btn');
    const backBtn = document.getElementById('back-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const menuBtn = document.getElementById('menu-btn');
    const restartBtn = document.getElementById('restart-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const muteBtn = document.getElementById('mute-btn');

    if (startBtn) startBtn.addEventListener('click', () => {
        initGame();
        stateManager.setState('playing');
    });
    
    if (controlsBtn) controlsBtn.addEventListener('click', () => {
        showScreen('controls');
    });
    
    if (backBtn) backBtn.addEventListener('click', () => {
        hideScreen('controls');
    });
    
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
        stateManager.setState('playing');
    });
    
    if (menuBtn) menuBtn.addEventListener('click', () => {
        audioManager.stopMusic();
        stateManager.setState('menu');
    });
    
    if (restartBtn) restartBtn.addEventListener('click', () => {
        audioManager.stopMusic();
        // Reiniciar completamente el juego desde nivel 1
        game = null;
        initGame();
        stateManager.setState('playing');
    });
    
    if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => {
        audioManager.stopMusic();
        stateManager.setState('menu');
    });
    
    if (muteBtn) muteBtn.addEventListener('click', () => {
        const muted = audioManager.toggleMute();
        muteBtn.textContent = muted ? '🔇 Silenciado' : '🔊 Sonido';
    });

    // Controles de teclado
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        if (e.key === 'p' || e.key === 'P') {
            if (stateManager.currentState === 'playing') {
                stateManager.setState('paused');
            } else if (stateManager.currentState === 'paused') {
                stateManager.setState('playing');
            }
        }
        
        if (e.key === 'm' || e.key === 'M') {
            const muted = audioManager.toggleMute();
            if (muteBtn) {
                muteBtn.textContent = muted ? '🔇 Silenciado' : '🔊 Sonido';
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Controles táctiles para móviles
    let touchStartX = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        keys[' '] = true;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        
        if (deltaX > 10) {
            keys['ArrowRight'] = true;
            keys['ArrowLeft'] = false;
        } else if (deltaX < -10) {
            keys['ArrowLeft'] = true;
            keys['ArrowRight'] = false;
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[' '] = false;
        keys['ArrowLeft'] = false;
        keys['ArrowRight'] = false;
    });
}

// Game loop
function loop(timestamp) {
    const dt = timestamp - lastTime > 100 ? 0.016 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    if (stateManager.currentState === 'playing' && game) {
        game.handleInput(keys);
    }
    
    stateManager.update(dt);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stateManager.render(ctx);
    
    requestAnimationFrame(loop);
}

// Inicialización
function init() {
    console.log('Inicializando juego...');
    setupEventListeners();
    
    loader.on('progress', (progress) => {
        const percent = Math.round(progress * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
    });
    
    loader.on('complete', () => {
        console.log('Carga completada');
        hideScreen('loading');
        showScreen('menu');
        lastTime = performance.now();
        requestAnimationFrame(loop);
    });
    
    loadAssets();
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
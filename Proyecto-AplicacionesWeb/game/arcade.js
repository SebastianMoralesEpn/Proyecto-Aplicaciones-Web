// Lógica del shooter/arcade - Versión profesional
import { Player, Enemy, Bullet, Particle } from '../engine/entity.js';

export class ArcadeGame {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.entities = [];
        this.particles = [];
        this.player = null;
        this.enemySpawnTimer = 0;
        this.level = 1;
        this.score = 0;
        this.highScore = localStorage.getItem('spaceDefenderHighScore') || 0;
        this.gameOver = false;
        this.backgroundY = 0;
        this.levelTime = 40;
        this.timeLeft = this.levelTime;
        this.levelComplete = false;
        this.stars = this.generateStars(100);
        this.backgroundPlanets = this.generatePlanets(3);
        this.loader = null; // Se establecerá después
    }

    setLoader(loader) {
        this.loader = loader;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 50 + 20,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
        return stars;
    }

    generatePlanets(count) {
        const planets = [];
        for (let i = 0; i < count; i++) {
            planets.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - 200,
                size: Math.random() * 60 + 40,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                speed: Math.random() * 10 + 5
            });
        }
        return planets;
    }

    init() {
        // Reiniciar todas las variables del juego
        this.level = 1;
        this.score = 0;
        this.gameOver = false;
        this.backgroundY = 0;
        this.timeLeft = this.levelTime;
        this.levelComplete = false;
        this.entities = [];
        this.particles = [];
        this.enemySpawnTimer = 0;

        this.player = new Player(this.canvas.width / 2 - 25, this.canvas.height - 80);
        this.player.canvas = this.canvas;
        this.entities.push(this.player);
        this.startLevel(this.level);
    }

    startLevel(level) {
        this.level = level;
        this.enemySpawnTimer = 0;
        this.timeLeft = this.levelTime;
        this.levelComplete = false;
        
        this.entities = this.entities.filter(entity => 
            entity.type === 'player' || entity.type === 'bullet'
        );

        this.createLevelStartEffect();
        
        if (level === 1) {
            this.audioManager.playMusic('background-music', 0.4);
        }
    }

    createLevelStartEffect() {
        for (let i = 0; i < 30; i++) {
            this.particles.push(new Particle(
                this.canvas.width / 2,
                this.canvas.height / 2,
                Math.random() * 360,
                Math.random() * 200 + 100,
                `hsl(${this.level * 60}, 100%, 60%)`,
                Math.random() * 2 + 1
            ));
        }
        this.audioManager.playSound('level-complete', 0.8);
    }

    update(dt) {
        if (this.gameOver) return;

        if (!this.levelComplete) {
            this.timeLeft -= dt;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.levelComplete = true;
                this.handleLevelComplete();
            }
        }

        this.backgroundY = (this.backgroundY + 80 * dt) % this.canvas.height;
        this.updateParticles(dt);
        this.entities.forEach(entity => entity.update(dt));
        
        this.enemySpawnTimer += dt;
        const spawnRate = this.calculateSpawnRate();
        if (this.enemySpawnTimer >= spawnRate && !this.levelComplete) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        this.checkCollisions();
        this.entities = this.entities.filter(entity => entity.active);
        this.particles = this.particles.filter(particle => particle.active);
    }

    calculateSpawnRate() {
        const baseRate = 2.0;
        const levelFactor = 0.15;
        return Math.max(0.3, baseRate - (this.level - 1) * levelFactor);
    }

    updateParticles(dt) {
        this.particles.forEach(particle => {
            particle.update(dt);
        });
    }

    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 40);
        let type = 'basic';
        
        const rand = Math.random();
        if (this.level >= 3 && rand < 0.15) {
            type = 'elite';
        } else if (this.level >= 2 && rand < 0.25) {
            type = 'strong';
        } else if (rand < 0.1) {
            type = 'strong';
        }

        const enemy = new Enemy(x, -40, type);
        enemy.canvas = this.canvas;
        
        let baseSpeed = 60;
        if (type === 'strong') baseSpeed = 40;
        if (type === 'elite') baseSpeed = 80;
        
        enemy.velocity.y = baseSpeed + this.level * 8;
        
        if (type === 'elite') {
            enemy.velocity.x = (Math.random() - 0.5) * 100;
        }

        this.entities.push(enemy);
    }

    checkCollisions() {
        const bullets = this.entities.filter(e => e.type === 'bullet');
        const enemies = this.entities.filter(e => e.type === 'enemy');

        bullets.forEach(bullet => {
            enemies.forEach(enemy => {
                if (bullet.collidesWith(enemy)) {
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    this.audioManager.playSound('enemy-hit', 0.5);
                    bullet.destroy();
                    if (enemy.takeDamage()) {
                        this.score += enemy.points;
                        this.updateHighScore();
                        enemy.destroy();
                        this.audioManager.playSound('explosion', 0.6);
                        this.createScorePopup(enemy.x, enemy.y, enemy.points);
                    }
                }
            });
        });

        enemies.forEach(enemy => {
            if (this.player.collidesWith(enemy)) {
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.audioManager.playSound('explosion', 0.7);
                enemy.destroy();
                if (this.player.takeDamage()) {
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.audioManager.playSound('game-over', 0.8);
                        this.createBigExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    }
                }
            }
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(
                x, y,
                Math.random() * 360,
                Math.random() * 100 + 50,
                '#ff6b35',
                Math.random() * 3 + 1
            ));
        }
    }

    createBigExplosion(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                x, y,
                Math.random() * 360,
                Math.random() * 200 + 100,
                '#ff4444',
                Math.random() * 4 + 2
            ));
        }
    }

    createScorePopup(x, y, points) {
        for (let i = 0; i < 5; i++) {
            const particle = new Particle(
                x, y,
                270 + (Math.random() * 60 - 30),
                Math.random() * 50 + 30,
                '#4bd',
                Math.random() * 2 + 1
            );
            particle.text = `+${points}`;
            particle.life = 1.5;
            this.particles.push(particle);
        }
    }

    handleLevelComplete() {
        const timeBonus = Math.floor(this.timeLeft * 10);
        if (timeBonus > 0) {
            this.score += timeBonus;
            this.createScorePopup(this.canvas.width/2, this.canvas.height/2, timeBonus);
        }
        
        setTimeout(() => {
            this.level++;
            this.startLevel(this.level);
        }, 3000);
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceDefenderHighScore', this.highScore);
        }
    }

    render() {
        const ctx = this.ctx;
        
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.entities.forEach(entity => this.renderEntityWithSprite(entity, ctx));
        this.renderUI(ctx);
        
        if (this.levelComplete) {
            this.renderLevelComplete(ctx);
        }

        if (this.gameOver) {
            this.renderGameOver(ctx);
        }
    }

    renderEntityWithSprite(entity, ctx) {
        if (!this.loader) {
            entity.render(ctx);
            return;
        }

        switch(entity.type) {
            case 'player':
                this.renderPlayer(entity, ctx);
                break;
            case 'enemy':
                this.renderEnemy(entity, ctx);
                break;
            case 'bullet':
                this.renderBullet(entity, ctx);
                break;
            default:
                entity.render(ctx);
        }
    }

    renderPlayer(player, ctx) {
        const sprite = this.loader.get('player');
        if (sprite && sprite.complete) {
            ctx.save();
            if (player.invulnerable > 0 && Math.floor(player.invulnerable * 10) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
            ctx.restore();
        } else {
            player.render(ctx);
        }
    }

    renderEnemy(enemy, ctx) {
        let spriteKey;
        switch(enemy.enemyType) {
            case 'elite':
                spriteKey = 'enemy-elite';
                break;
            case 'strong':
                spriteKey = 'enemy-strong';
                break;
            default:
                spriteKey = 'enemy-basic';
        }

        const sprite = this.loader.get(spriteKey);
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, enemy.x, enemy.y, enemy.width, enemy.height);
            
            if (enemy.health > 1) {
                const barWidth = enemy.width;
                const barHeight = 4;
                const healthPercent = enemy.health / (enemy.enemyType === 'elite' ? 2 : 3);
                
                ctx.fillStyle = '#333';
                ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
                ctx.fillStyle = enemy.enemyType === 'elite' ? '#ff44ff' : '#44ff44';
                ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
            }
        } else {
            enemy.render(ctx);
        }
    }

    renderBullet(bullet, ctx) {
        const sprite = this.loader.get('bullet');
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, bullet.x, bullet.y, bullet.width, bullet.height);
        } else {
            bullet.render(ctx);
        }
    }

    renderBackground(ctx) {
        // Dibujar imagen de fondo si está cargada
        const backgroundImage = this.loader ? this.loader.get('background') : null;
        if (backgroundImage && backgroundImage.complete) {
            ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback: fondo negro si la imagen no está disponible
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Dibujar estrellas encima de la imagen
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            const y = (star.y + this.backgroundY * 0.3) % this.canvas.height;
            ctx.globalAlpha = star.brightness * 0.3;
            ctx.fillRect(star.x, y, star.size, star.size);
        });

        this.stars.forEach(star => {
            if (star.size > 1.5) {
                const y = (star.y + this.backgroundY * 0.7) % this.canvas.height;
                ctx.globalAlpha = star.brightness * 0.6;
                ctx.fillRect(star.x, y, star.size, star.size);
            }
        });

        ctx.globalAlpha = 1.0;
    }

    renderParticles(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }

    renderUI(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 100);
        ctx.strokeStyle = '#4bd';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 200, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Segoe UI", system-ui';
        ctx.fillText(`NIVEL: ${this.level}`, 20, 30);
        ctx.fillText(`PUNTUACIÓN: ${this.score}`, 20, 50);
        ctx.fillText(`RÉCORD: ${this.highScore}`, 20, 70);
        ctx.fillText(`VIDAS: ${this.player.lives}`, 20, 90);

        const timeWidth = 200;
        const timeHeight = 8;
        const timeX = this.canvas.width - timeWidth - 10;
        const timeY = 20;

        ctx.fillStyle = '#333';
        ctx.fillRect(timeX, timeY, timeWidth, timeHeight);
        
        const progress = this.timeLeft / this.levelTime;
        ctx.fillStyle = progress > 0.5 ? '#4bd' : progress > 0.2 ? '#ffa500' : '#ff4444';
        ctx.fillRect(timeX, timeY, timeWidth * progress, timeHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Segoe UI", system-ui';
        ctx.fillText(`TIEMPO: ${Math.ceil(this.timeLeft)}s`, timeX, timeY - 5);
    }

    renderLevelComplete(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#4bd';
        ctx.font = 'bold 36px "Segoe UI", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`¡NIVEL ${this.level} COMPLETADO!`, this.canvas.width/2, this.canvas.height/2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px "Segoe UI", system-ui';
        ctx.fillText(`Próximo nivel en ${Math.ceil(this.timeLeft + 3)}...`, this.canvas.width/2, this.canvas.height/2 + 20);
        ctx.textAlign = 'left';
    }

    renderGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#f44';
        ctx.font = 'bold 48px "Segoe UI", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px "Segoe UI", system-ui';
        ctx.fillText(`Puntuación final: ${this.score}`, this.canvas.width/2, this.canvas.height/2);
        ctx.fillText(`Récord: ${this.highScore}`, this.canvas.width/2, this.canvas.height/2 + 40);
        ctx.textAlign = 'left';
    }

    handleInput(keys) {
        if (this.gameOver || this.levelComplete) return;

        if (keys['ArrowLeft']) {
            this.player.velocity.x = -400;
        } else if (keys['ArrowRight']) {
            this.player.velocity.x = 400;
        } else {
            this.player.velocity.x = 0;
        }

        if (keys[' ']) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.entities.push(bullet);
                this.createMuzzleFlash();
                this.audioManager.playSound('shoot', 0.3);
            }
        }
    }

    createMuzzleFlash() {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                this.player.x + this.player.width/2,
                this.player.y,
                270 + (Math.random() * 30 - 15),
                Math.random() * 100 + 50,
                '#ffff00',
                Math.random() * 2 + 1
            ));
        }
    }

    getGameState() {
        return {
            score: this.score,
            level: this.level,
            lives: this.player.lives,
            gameOver: this.gameOver,
            timeLeft: this.timeLeft,
            levelComplete: this.levelComplete
        };
    }
}
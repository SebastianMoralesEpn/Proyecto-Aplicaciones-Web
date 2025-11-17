// Clase base para todas las entidades del juego
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.active = true;
        this.type = 'entity';
    }

    update(dt) {
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
    }

    render(ctx) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    destroy() {
        this.active = false;
    }
}

// Sistema de partículas
export class Particle {
    constructor(x, y, angle, speed, color, size) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: Math.cos(angle * Math.PI / 180) * speed,
            y: Math.sin(angle * Math.PI / 180) * speed
        };
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.active = true;
        this.text = null;
    }

    update(dt) {
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
        this.life -= this.decay * dt * 60;
        
        // Efecto de gravedad
        this.velocity.y += 100 * dt;
        
        // Efecto de fricción
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        if (this.text) {
            // Renderizar texto de puntuación
            ctx.fillStyle = this.color;
            ctx.font = `bold ${Math.floor(this.size * 4)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x, this.y);
        } else {
            // Renderizar partícula normal
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Entidad para el jugador
export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 50, 40);
        this.type = 'player';
        this.lives = 3;
        this.score = 0;
        this.shootCooldown = 0;
        this.invulnerable = 0;
    }

    update(dt) {
        super.update(dt);
        
        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }
        
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }
        
        this.x = Math.max(20, Math.min(this.canvas?.width - this.width - 20 || 910, this.x));
    }

    render(ctx) {
        // Fallback render - se usará si no hay sprite
        ctx.save();
        
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = '#4bd';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2a9';
        ctx.fillRect(this.x + this.width/2 - 10, this.y + 10, 20, 15);

        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(this.x + 10, this.y + this.height - 5, 10, 8);
        ctx.fillRect(this.x + this.width - 20, this.y + this.height - 5, 10, 8);

        ctx.restore();
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = 0.2;
            return new Bullet(this.x + this.width/2 - 3, this.y, 0, -600);
        }
        return null;
    }

    takeDamage() {
        if (this.invulnerable <= 0) {
            this.lives--;
            this.invulnerable = 2.0;
            return true;
        }
        return false;
    }
}

// Entidad para enemigos
export class Enemy extends Entity {
    constructor(x, y, type = 'basic') {
        const size = type === 'elite' ? 35 : type === 'strong' ? 45 : 40;
        super(x, y, size, size);
        this.type = 'enemy';
        this.enemyType = type;
        
        switch(type) {
            case 'elite':
                this.health = 2;
                this.points = 500;
                break;
            case 'strong':
                this.health = 3;
                this.points = 300;
                break;
            default:
                this.health = 1;
                this.points = 100;
        }
    }

    update(dt) {
        super.update(dt);
        this.y += this.velocity.y * dt;
        this.x += this.velocity.x * dt;
        
        if (this.enemyType === 'elite') {
            if (this.x <= 0 || this.x >= (this.canvas?.width || 960) - this.width) {
                this.velocity.x *= -1;
            }
        }
    }

    render(ctx) {
        // Fallback render
        let color, detailColor;
        
        switch(this.enemyType) {
            case 'elite':
                color = '#ff44ff';
                detailColor = '#ffaaff';
                break;
            case 'strong':
                color = '#ff8844';
                detailColor = '#ffbb88';
                break;
            default:
                color = '#ff4444';
                detailColor = '#ff8888';
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = detailColor;
        ctx.fillRect(this.x + this.width/4, this.y + this.height/4, this.width/2, this.height/4);

        if (this.health > 1) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / (this.enemyType === 'elite' ? 2 : 3);
            
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
            ctx.fillStyle = this.enemyType === 'elite' ? '#ff44ff' : '#44ff44';
            ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
        }
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
}

// Entidad para balas
export class Bullet extends Entity {
    constructor(x, y, vx, vy) {
        super(x, y, 6, 20);
        this.type = 'bullet';
        this.velocity.x = vx;
        this.velocity.y = vy;
        this.damage = 1;
    }

    update(dt) {
        super.update(dt);
        if (this.y < -20 || this.y > 560) {
            this.destroy();
        }
    }

    render(ctx) {
        // Fallback render
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ffa500');
        gradient.addColorStop(1, '#ff4444');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.x + 1, this.y + 2, this.width - 2, 4);
        ctx.globalAlpha = 1.0;
    }
}
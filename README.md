# Proyecto 1er Bimestre — HTML5 Game

Juego arcade shooter desarrollado con HTML5 Canvas y JavaScript.

## 🎮 Descripción
**Space Defender** es un shooter espacial side-scrolling donde controlas una nave que debe defender la galaxia de oleadas de enemigos. Sobrevive el mayor tiempo posible, acumula puntos y avanza de nivel. El juego cuenta con niveles infinitos con dificultad progresiva, donde cada nivel dura 40 segundos y debes sobrevivir para pasar al siguiente.

## ✨ Características
- **Gráficos con Canvas HTML5**: Renderizado en tiempo real con sprites personalizados.
- **Sistema de Audio Profesional**: Música de fondo, efectos de sonido para disparos, explosiones, etc.
- **Estados del Juego**: Menú principal, pantalla de controles, pausa, game over y niveles.
- **Enemigos Variados**: Básicos (100 puntos), Fuertes (300 puntos) y Élite (500 puntos) con diferentes comportamientos.
- **Sistema de Partículas**: Efectos visuales para explosiones, disparos y transiciones.
- **Guardado de Puntajes**: Récord personal almacenado en localStorage.
- **Dificultad Progresiva**: Enemigos aparecen más rápido y con mayor frecuencia en niveles superiores.

## 🎯 Mecánicas de Juego
- **Objetivo**: Sobrevivir 40 segundos por nivel destruyendo enemigos.
- **Vidas**: 3 vidas iniciales. Pierdes una al colisionar con un enemigo.
- **Puntuación**: Gana puntos destruyendo enemigos. Bonus por tiempo restante al completar nivel.
- **Niveles**: Infinitos, con spawn rate decreciente y velocidad de enemigos creciente.
- **Invulnerabilidad Temporal**: Después de recibir daño, eres invulnerable por 2 segundos.
- **Pausa y Reinicio**: Posibilidad de pausar y reiniciar desde el menú.

## 🚀 Ejecutar
1. Clona o descarga el proyecto.
2. Usa un servidor estático (recomendado: VS Code Live Server o cualquier servidor local).
3. Abre `index.html` en tu navegador.
4. Espera a que se carguen los recursos (barra de progreso).
5. ¡Disfruta del juego!

## 🎯 Controles
### Teclado:
- **← →** : Moverse izquierda/derecha
- **ESPACIO** : Disparar
- **P** : Pausar/Reanudar
- **M** : Silenciar/Activar sonido

## 🏗️ Estructura del Proyecto
```
Proyecto-AplicacionesWeb/
├── index.html                 # Página principal con canvas y menús
├── main.js                    # Punto de entrada: inicialización, eventos, game loop
├── styles.css                 # Estilos CSS para UI y responsive design
├── README.md                  # Este archivo
├── assets/                    # Recursos del juego
│   ├── audio/                 # Archivos de sonido
│   │   ├── background-music.mp3
│   │   ├── enemy-hit.wav
│   │   ├── explosion.wav
│   │   ├── game-over.wav
│   │   ├── level-complete.mp3
│   │   └── shoot.wav
│   └── images/                # Sprites y fondos
│       ├── background.jpg
│       ├── bullet.png
│       ├── enemy-basic.png
│       ├── enemy-elite.png
│       ├── enemy-strong.png
│       └── player.png
├── engine/                    # Motor del juego
│   ├── audioManager.js        # Gestión de audio (sonidos y música)
│   ├── entity.js              # Clases base: Entity, Player, Enemy, Bullet, Particle
│   ├── loader.js              # Carga de recursos (imágenes y audio)
│   └── stateManager.js        # Gestión de estados del juego
└── game/                      # Lógica específica del juego
    └── arcade.js              # Clase ArcadeGame: lógica principal, niveles, colisiones
```

## 🛠️ Tecnologías Utilizadas
- **HTML5 Canvas**: Para renderizado gráfico.
- **JavaScript ES6 Modules**: Arquitectura modular con imports/exports.
- **CSS3**: Estilos modernos con gradientes, sombras y animaciones.
- **Audio API**: Reproducción de sonidos y música.
- **LocalStorage**: Persistencia de récords.
- **Responsive Design**: Adaptable a diferentes dispositivos.

## 📱 Compatibilidad
- Navegadores modernos con soporte para Canvas y ES6.
- Requiere servidor local para cargar recursos (debido a CORS).

## 🎨 Assets
- **Imágenes**: Sprites personalizados para nave, enemigos, balas y fondo.
- **Audio**: Música de fondo y efectos de sonido en formato MP3/WAV.

## 📝 Notas de Desarrollo
- El proyecto sigue un patrón de arquitectura modular con separación de responsabilidades.
- Usa un game loop basado en `requestAnimationFrame` para 60 FPS.
- Sistema de entidades con herencia para reutilización de código.
- Gestión de estados para navegación entre menús y juego.

## 👨‍💻 Autores
Desarrollado por Sebastián Morales Y Freddy Jimenez como proyecto del primer bimestre para el curso de Aplicaciones Web.

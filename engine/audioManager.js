// Gestor de audio profesional
export class AudioManager {
    constructor(loader) {
        this.loader = loader;
        this.muted = false;
        this.music = null;
    }

    playSound(key, volume = 0.7) {
        if (this.muted) return;
        
        const sound = this.loader.get(key);
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = volume;
            clone.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    playMusic(key, volume = 0.5, loop = true) {
        if (this.muted) return;
        
        this.stopMusic();
        this.music = this.loader.get(key);
        if (this.music) {
            this.music.volume = volume;
            this.music.loop = loop;
            this.music.play().catch(e => console.log('Music play failed:', e));
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    setMuted(muted) {
        this.muted = muted;
        if (this.music) {
            this.music.volume = muted ? 0 : 0.5;
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }
}
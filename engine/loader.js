// Sistema de carga de recursos
export class Loader {
    constructor() {
        this.assets = new Map();
        this.loaded = 0;
        this.total = 0;
        this.callbacks = {
            progress: [],
            complete: []
        };
    }

    loadImage(key, src) {
        this.total++;
        const img = new Image();
        img.onload = () => {
            this.loaded++;
            this.assets.set(key, img);
            this.onProgress();
        };
        img.onerror = () => {
            console.error(`Error loading image: ${src}`);
            this.loaded++;
            this.onProgress();
        };
        img.src = src;
    }

    loadAudio(key, src) {
        this.total++;
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => {
            this.loaded++;
            this.assets.set(key, audio);
            this.onProgress();
        }, { once: true });
        audio.onerror = () => {
            console.error(`Error loading audio: ${src}`);
            this.loaded++;
            this.onProgress();
        };
        audio.src = src;
        audio.load();
    }

    get(key) {
        return this.assets.get(key);
    }

    onProgress() {
        const progress = this.total > 0 ? this.loaded / this.total : 1;
        this.callbacks.progress.forEach(callback => callback(progress));
        
        if (this.loaded === this.total && this.total > 0) {
            this.callbacks.complete.forEach(callback => callback());
        }
    }

    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
}
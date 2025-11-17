// Gestor de estados del juego
export class StateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
    }

    addState(name, state) {
        this.states.set(name, state);
    }

    setState(name) {
        if (this.states.has(name)) {
            this.previousState = this.currentState;
            this.currentState = name;
            
            // Ejecutar callbacks de entrada/salida
            if (this.previousState && this.states.get(this.previousState).onExit) {
                this.states.get(this.previousState).onExit();
            }
            
            if (this.states.get(name).onEnter) {
                this.states.get(name).onEnter();
            }
        }
    }

    getCurrentState() {
        return this.states.get(this.currentState);
    }

    update(dt) {
        if (this.currentState && this.states.get(this.currentState).update) {
            this.states.get(this.currentState).update(dt);
        }
    }

    render(ctx) {
        if (this.currentState && this.states.get(this.currentState).render) {
            this.states.get(this.currentState).render(ctx);
        }
    }
}
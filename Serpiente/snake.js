class Serpiente {
    constructor() {
        const fila = 10;
        const col = 7;

        this.direccion = "derecha";

        this.segmentos = [
            { fila: fila, col: col },
            { fila: fila, col: col - 1 },
            { fila: fila, col: col - 2 }
        ];
    }

    obtenerCabeza() {
        return this.segmentos[0];
    }

    cambiarDireccion(nueva) {
        const opuestos = {
            arriba: "abajo",
            abajo: "arriba",
            izquierda: "derecha",
            derecha: "izquierda"
        };

        if (opuestos[nueva] !== this.direccion) {
            this.direccion = nueva;
        }
    }

    mover(comio) {
        const cabeza = { ...this.obtenerCabeza() };

        switch (this.direccion) {
            case "arriba": cabeza.fila--; break;
            case "abajo": cabeza.fila++; break;
            case "izquierda": cabeza.col--; break;
            case "derecha": cabeza.col++; break;
        }

        this.segmentos.unshift(cabeza);

        if (!comio) {
            this.segmentos.pop();
        }
    }

    chocaCon(fila, col) {
        return this.segmentos.some(s => s.fila === fila && s.col === col);
    }
}

class Comida {
    constructor(tablero, serpiente) {
        this.tablero = tablero;
        this.serpiente = serpiente;
        this.fila = null;
        this.col = null;
        this.generar();
    }

    generar() {
        let f, c;
        do {
            f = Math.floor(Math.random() * 20);
            c = Math.floor(Math.random() * 20);
        } while (this.serpiente.chocaCon(f, c));

        this.fila = f;
        this.col = c;
    }
}

class Juego {
    constructor() {
        this.tablero = document.querySelector("#tablero");
        this.puntos = document.querySelector("#puntos");
        this.btn = document.querySelector("#startBtn");

        this.serpiente = null;
        this.comida = null;
        this.intervalo = null;

        this.crearTablero();
        this.eventos();

        console.log("Juego listo");
    }

    crearTablero() {
        for (let fila = 0; fila < 20; fila++) {
            for (let col = 0; col < 20; col++) {
                const celda = document.createElement("div");
                celda.classList.add("celda");
                celda.dataset.fila = fila;
                celda.dataset.col = col;
                this.tablero.appendChild(celda);
            }
        }
    }

    getCelda(f, c) {
        return document.querySelector(`.celda[data-fila="${f}"][data-col="${c}"]`);
    }

    iniciar() {
        clearInterval(this.intervalo);

        this.puntos.textContent = "0";

        document.querySelectorAll(".celda").forEach(c =>
            c.classList.remove("snake", "snake-head", "snake-tail", "food")
        );

        this.serpiente = new Serpiente();
        this.comida = new Comida(this.tablero, this.serpiente);

        this.dibujarSerpiente();
        this.dibujarComida();

        this.intervalo = setInterval(() => this.bucle(), 200);
    }

    eventos() {
        this.btn.addEventListener("click", () => this.iniciar());

        document.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") this.serpiente.cambiarDireccion("arriba");
            if (e.key === "ArrowDown") this.serpiente.cambiarDireccion("abajo");
            if (e.key === "ArrowLeft") this.serpiente.cambiarDireccion("izquierda");
            if (e.key === "ArrowRight") this.serpiente.cambiarDireccion("derecha");
        });
    }

    bucle() {
        const cabeza = { ...this.serpiente.obtenerCabeza() };

        // Mover una copia temporal para detectar colisión
        switch (this.serpiente.direccion) {
            case "arriba": cabeza.fila--; break;
            case "abajo": cabeza.fila++; break;
            case "izquierda": cabeza.col--; break;
            case "derecha": cabeza.col++; break;
        }

        // Colisión paredes
        if (cabeza.fila < 0 || cabeza.fila >= 20 || cabeza.col < 0 || cabeza.col >= 20) {
            return this.gameOver();
        }

        // Colisión consigo misma
        if (this.serpiente.chocaCon(cabeza.fila, cabeza.col)) {
            return this.gameOver();
        }

        // ¿Come comida?
        const come = cabeza.fila === this.comida.fila && cabeza.col === this.comida.col;

        this.serpiente.mover(come);

        if (come) {
            this.puntos.textContent = parseInt(this.puntos.textContent) + 10;
            this.comida.generar();
        }

        this.dibujar();
    }

    dibujar() {
        document.querySelectorAll(".celda").forEach(c => {
            c.classList.remove("snake", "snake-head", "snake-tail", "food");
            c.style.transform = "";
        });

        this.dibujarSerpiente();
        this.dibujarComida();
    }

    dibujarSerpiente() {
        this.serpiente.segmentos.forEach((seg, i) => {
            const celda = this.getCelda(seg.fila, seg.col);

            if (i === 0) {
                // Cabeza
                celda.classList.add("snake-head");
                switch (this.serpiente.direccion) {
                    case "arriba": celda.style.transform = "rotate(180deg)"; break;
                    case "abajo": celda.style.transform = "rotate(0deg)"; break;
                    case "izquierda": celda.style.transform = "rotate(90deg)"; break;
                    case "derecha": celda.style.transform = "rotate(-90deg)"; break;
                }
                return;
            }

            if (i === this.serpiente.segmentos.length - 1) {
                // Cola
                celda.classList.add("snake-tail");

                const penultimo = this.serpiente.segmentos[this.serpiente.segmentos.length - 2];

                if (seg.fila < penultimo.fila) celda.style.transform = "rotate(0deg)";
                else if (seg.fila > penultimo.fila) celda.style.transform = "rotate(180deg)";
                else if (seg.col < penultimo.col) celda.style.transform = "rotate(-90deg)";
                else if (seg.col > penultimo.col) celda.style.transform = "rotate(90deg)";

                return;
            }

            // Cuerpo
            celda.classList.add("snake");
            celda.style.transform = ""; // Reset por si acaso
        });
    }


    dibujarComida() {
        const celda = this.getCelda(this.comida.fila, this.comida.col);
        celda.classList.add("food");
    }

    gameOver() {
        clearInterval(this.intervalo);
        alert("¡Game Over!");
    }
}

new Juego();

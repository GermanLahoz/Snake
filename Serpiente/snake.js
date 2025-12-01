let tablero = document.body.querySelector('#tablero');
let startBtn = document.body.querySelector('#startBtn');
let puntos = document.body.querySelector('#puntos');

// Clase para manejar el dibujado de la serpiente
class Serpiente {
    constructor() {
        this.direccion = 'derecha';
        this.proximaDireccion = 'derecha'; 
        this.direccionCambiada = false;
    }

    dibujarSnake(snake) {
        document.querySelectorAll('.celda').forEach(c => {
            c.classList.remove('snake', 'snake-head', 'snake-tail');
            c.style.transform = '';
        });

        snake.forEach((segmento, index) => {
            const celda = this.getCelda(segmento.fila, segmento.col);

            if (index === 0) {
                // Cabeza
                celda.classList.add('snake-head');
                this.dibujarCabeza(celda);
            } else if (index === snake.length - 1) {
                // Cola
                celda.classList.add('snake-tail');
                this.dibujarCola(celda, segmento, snake[snake.length - 2]);
            } else {
                // Cuerpo
                celda.classList.add('snake');
            }
        });
    }

    dibujarCabeza(celda) {
        switch (this.direccion) {
            case 'arriba': celda.style.transform = 'rotate(180deg)'; break;
            case 'abajo': celda.style.transform = 'rotate(0deg)'; break;
            case 'izquierda': celda.style.transform = 'rotate(90deg)'; break;
            case 'derecha': celda.style.transform = 'rotate(-90deg)'; break;
        }
    }

    dibujarCola(celda, segmento, penultimo) {
        if (segmento.fila < penultimo.fila) celda.style.transform = 'rotate(0deg)';
        else if (segmento.fila > penultimo.fila) celda.style.transform = 'rotate(180deg)';
        else if (segmento.col < penultimo.col) celda.style.transform = 'rotate(-90deg)';
        else if (segmento.col > penultimo.col) celda.style.transform = 'rotate(90deg)';
    }

    getCelda(fila, col) {
        return document.querySelector(`.celda[data-fila="${fila}"][data-col="${col}"]`);
    }

    setProximaDireccion(nuevaDireccion) {
        // Solo permitir cambiar dirección si no se ha cambiado en este ciclo
        if (!this.direccionCambiada) {
            // Validar que no sea un giro de 180 grados
            const opuestos = {
                'arriba': 'abajo',
                'abajo': 'arriba',
                'izquierda': 'derecha',
                'derecha': 'izquierda'
            };

            if (nuevaDireccion !== opuestos[this.direccion]) {
                this.proximaDireccion = nuevaDireccion;
                this.direccionCambiada = true;
            }
        }
    }

    actualizarDireccion() {
        // Actualizar la dirección real solo al comienzo de cada movimiento
        this.direccion = this.proximaDireccion;
        this.direccionCambiada = false; // Resetear para el próximo ciclo
    }

    getDireccion() {
        return this.direccion;
    }

    resetDireccion() {
        this.direccion = 'derecha';
        this.proximaDireccion = 'derecha';
        this.direccionCambiada = false;
    }
}

// Clase para manejar el movimiento de la serpiente
class Juego {
    constructor(Serpiente) {
        this.Serpiente = Serpiente;
    }

    moverSnake(snake) {
        const cabeza = { ...snake[0] };
        
        // Actualizar dirección antes de mover
        this.Serpiente.actualizarDireccion();
        
        switch (this.Serpiente.getDireccion()) {
            case 'arriba': cabeza.fila--; break;
            case 'abajo': cabeza.fila++; break;
            case 'izquierda': cabeza.col--; break;
            case 'derecha': cabeza.col++; break;
        }

        return cabeza;
    }

    verificarColision(cabeza, snake) {
        // Colisión con bordes
        if (cabeza.fila < 0 || cabeza.fila >= 20 || 
            cabeza.col < 0 || cabeza.col >= 20) {
            return true;
        }

        // Colisión con el cuerpo (excepto la cola que se moverá)
        for (let i = 0; i < snake.length - 1; i++) {
            if (snake[i].fila === cabeza.fila && snake[i].col === cabeza.col) {
                return true;
            }
        }
        
        return false;
    }

    manejarComida(cabeza, snake, puntosElement) {
        const comida = document.querySelector('.food');
        const filaComida = parseInt(comida.dataset.fila);
        const colComida = parseInt(comida.dataset.col);

        if (cabeza.fila === filaComida && cabeza.col === colComida) {
            puntosElement.textContent = parseInt(puntosElement.textContent) + 10;
            comida.classList.remove('food');
            return true; // Se comió la comida
        }
        return false; // No se comió la comida
    }

    actualizarSnake(snake, nuevaCabeza, comidaComida) {
        if (!comidaComida) {
            snake.pop();
        }
        snake.unshift(nuevaCabeza);
        return snake;
    }
}

// Clase para generar comida
class Comida {
    generarComida(snake) {
        let fila, col;
        let intentos = 0;
        const maxIntentos = 400; // 20x20 = 400 celdas máximas

        do {
            fila = Math.floor(Math.random() * 20);
            col = Math.floor(Math.random() * 20);
            intentos++;
            
            // Prevenir bucle infinito
            if (intentos >= maxIntentos) {
                console.warn('No se pudo encontrar espacio para comida');
                return null;
            }
        } while (snake.some(seg => seg.fila === fila && seg.col === col));

        const celda = this.getCelda(fila, col);
        celda.classList.add('food');
        return { fila, col };
    }

    getCelda(fila, col) {
        return document.querySelector(`.celda[data-fila="${fila}"][data-col="${col}"]`);
    }
}

// Inicialización del tablero
for (let fila = 0; fila < 20; fila++) {
    for (let col = 0; col < 20; col++) {
        const celda = document.createElement('div');
        celda.classList.add('celda');
        celda.dataset.fila = fila;
        celda.dataset.col = col;
        tablero.appendChild(celda);
    }
}

// Instanciar las clases
const serpiente = new Serpiente();
const juego = new Juego(serpiente);
const comida = new Comida();

// Variables del juego
let snake = [];
let intervalo;
let juegoActivo = false;

// Event listeners
startBtn.addEventListener('click', () => {
    document.querySelectorAll('.celda').forEach(c => c.classList.remove('snake', 'snake-head', 'food'));
    puntos.textContent = 0;
    clearInterval(intervalo);

    const centroFila = 10;
    const centroCol = 7;
    
    snake = [
        { fila: centroFila, col: centroCol },
        { fila: centroFila, col: centroCol - 1 },
        { fila: centroFila, col: centroCol - 2 }
    ];

    serpiente.resetDireccion();
    serpiente.dibujarSnake(snake);
    comida.generarComida(snake);
    
    juegoActivo = true;
    intervalo = setInterval(() => {
        if (!juegoActivo) return;
        
        const nuevaCabeza = juego.moverSnake(snake);
        
        if (juego.verificarColision(nuevaCabeza, snake)) {
            alert('¡Game Over!');
            clearInterval(intervalo);
            juegoActivo = false;
            return;
        }

        const comidaComida = juego.manejarComida(nuevaCabeza, snake, puntos);
        
        snake = juego.actualizarSnake(snake, nuevaCabeza, comidaComida);
        
        if (comidaComida) {
            comida.generarComida(snake);
        }
        
        serpiente.dibujarSnake(snake);
    }, 150);
});

document.addEventListener('keydown', (e) => {
    if (!juegoActivo) return;
    
    if (e.key === 'ArrowUp') {
        serpiente.setProximaDireccion('arriba');
    } else if (e.key === 'ArrowDown') {
        serpiente.setProximaDireccion('abajo');
    } else if (e.key === 'ArrowLeft') {
        serpiente.setProximaDireccion('izquierda');
    } else if (e.key === 'ArrowRight') {
        serpiente.setProximaDireccion('derecha');
    }
});
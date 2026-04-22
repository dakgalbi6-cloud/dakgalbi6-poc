/**
 * Speetto 1000 Scratch-off Simulator
 * Improved Design & Logic
 */

class ScratchEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.options = {
            brushSize: 35,
            threshold: 75,
            onThresholdMet: () => {},
            ...options
        };

        this.init();
    }

    init() {
        this.resize();
        this.fill();
        this.addEventListeners();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    fill() {
        const { ctx, canvas } = this;
        // Create a more realistic silver texture
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        
        // Metallic sheen
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(255,255,255,0.3)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(255,255,255,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    addEventListeners() {
        const start = (e) => {
            this.isDrawing = true;
            this.scratch(e);
        };
        const end = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.checkScratched();
            }
        };
        const move = (e) => {
            if (this.isDrawing) {
                this.scratch(e);
            }
        };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            move(e.touches[0]);
        });
        window.addEventListener('touchend', end);
    }

    scratch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.options.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
    }

    checkScratched() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparent = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }

        const percentage = (transparent / (pixels.length / 4)) * 100;
        if (percentage > this.options.threshold) {
            this.revealAll();
            this.options.onThresholdMet();
        }
    }

    revealAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class SpeettoGame {
    constructor() {
        this.luckyNumber = 0;
        this.myNumbers = [];
        this.prizes = ['1,000원', '5,000원', '10,000원', '100,000원', '1,000,000원', '5억원'];
        this.isFinished = false;

        this.luckyEl = document.getElementById('lucky-numbers');
        this.myEl = document.getElementById('my-numbers');
        this.resetBtn = document.getElementById('reset-btn');
        this.modal = document.getElementById('win-modal');
        this.modalClose = document.getElementById('modal-close');

        this.init();
    }

    init() {
        this.resetBtn.addEventListener('click', () => this.startNewGame());
        this.modalClose.addEventListener('click', () => this.modal.classList.add('hidden'));
        this.startNewGame();
    }

    startNewGame() {
        this.isFinished = false;
        this.generateNumbers();
        this.renderNumbers();
        
        new ScratchEngine('scratch-canvas', {
            onThresholdMet: () => this.handleFinish()
        });
    }

    generateNumbers() {
        // One lucky number
        this.luckyNumber = Math.floor(Math.random() * 30) + 1;
        
        // 4 player numbers for Speetto 1000 style grid
        this.myNumbers = Array.from({ length: 4 }, () => {
            const num = Math.floor(Math.random() * 30) + 1;
            // 20% win chance per cell for the PoC
            const forceWin = Math.random() < 0.15;
            const finalNum = forceWin ? this.luckyNumber : num;
            
            const prizeIdx = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * this.prizes.length);
            
            return {
                val: finalNum,
                prize: this.prizes[prizeIdx],
                isWin: finalNum === this.luckyNumber
            };
        });
    }

    renderNumbers() {
        // Render lucky number
        this.luckyEl.innerHTML = `<span>${this.luckyNumber}</span>`;

        // Render my numbers (Fixed the [object] bug by accessing .val and .prize)
        this.myEl.innerHTML = this.myNumbers.map(n => `
            <div class="number-cell ${this.isFinished && n.isWin ? 'winner' : ''}">
                <span class="val">${n.val}</span>
                <span class="prize">${n.prize}</span>
            </div>
        `).join('');
    }

    handleFinish() {
        if (this.isFinished) return;
        this.isFinished = true;

        // Apply winning styles
        const cells = this.myEl.querySelectorAll('.number-cell');
        this.myNumbers.forEach((n, i) => {
            if (n.isWin) {
                cells[i].classList.add('winner');
            }
        });

        const wins = this.myNumbers.filter(n => n.isWin);
        if (wins.length > 0) {
            const prizeText = wins.map(w => w.prize).join(' + ');
            setTimeout(() => this.showWinModal(prizeText), 500);
        }
    }

    showWinModal(prize) {
        document.getElementById('win-message').textContent = `당첨금: ${prize}`;
        this.modal.classList.remove('hidden');
    }
}

window.addEventListener('load', () => {
    new SpeettoGame();
});

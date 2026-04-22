/**
 * Speetto 1000 Scratch-off Simulator
 */

class ScratchEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.options = {
            brushSize: 30,
            threshold: 80,
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
        // Create a silver/gray gradient for the coating
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#bdc3c7');
        grad.addColorStop(0.5, '#95a5a6');
        grad.addColorStop(1, '#7f8c8d');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some "scratchable" texture
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    addEventListeners() {
        const start = (e) => {
            this.isDrawing = true;
            this.scratch(e);
        };
        const end = () => {
            this.isDrawing = false;
            this.checkScratched();
        };
        const move = (e) => {
            if (this.isDrawing) {
                this.scratch(e);
            }
        };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', move);
        this.canvas.addEventListener('mouseup', end);
        this.canvas.addEventListener('mouseleave', end);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            move(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', end);
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

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) {
                transparent++;
            }
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
        this.luckyNumbers = [];
        this.myNumbers = [];
        this.prizes = ['1,000원', '5,000원', '10,000원', '100,000원', '1,000,000원', '500,000,000원'];
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
        // Generate 2 lucky numbers (1-30)
        this.luckyNumbers = Array.from({ length: 2 }, () => Math.floor(Math.random() * 30) + 1);
        
        // Generate 6 player numbers with prizes
        this.myNumbers = Array.from({ length: 6 }, () => {
            const num = Math.floor(Math.random() * 30) + 1;
            // Determine prize based on simple probability (just for PoC)
            const prizeIdx = Math.random() < 0.8 ? 0 : Math.floor(Math.random() * this.prizes.length);
            return {
                val: num,
                prize: this.prizes[prizeIdx],
                isWin: this.luckyNumbers.includes(num)
            };
        });
    }

    renderNumbers() {
        this.luckyEl.innerHTML = this.luckyNumbers.map(n => `
            <div class="number-item">
                <span class="val">${n}</span>
            </div>
        `).join('');

        this.myEl.innerHTML = this.myNumbers.map(n => `
            <div class="number-item ${this.isFinished && n.isWin ? 'winner' : ''}">
                <span class="val">${n}</span>
                <span class="prize">${n.prize}</span>
            </div>
        `).join('');
    }

    handleFinish() {
        if (this.isFinished) return;
        this.isFinished = true;

        // Re-render to show winning state (pulse animation etc)
        this.myEl.innerHTML = this.myNumbers.map(n => `
            <div class="number-item ${n.isWin ? 'winner' : ''}">
                <span class="val">${n.val}</span>
                <span class="prize">${n.prize}</span>
            </div>
        `).join('');

        const wins = this.myNumbers.filter(n => n.isWin);
        if (wins.length > 0) {
            const totalPrize = wins.map(w => w.prize).join(', ');
            this.showWinModal(totalPrize);
        }
    }

    showWinModal(prize) {
        document.getElementById('win-message').textContent = `당첨금: ${prize}`;
        this.modal.classList.remove('hidden');
    }
}

// Start the game
window.addEventListener('load', () => {
    new SpeettoGame();
});

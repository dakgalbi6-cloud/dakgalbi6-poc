/**
 * Speetto 1000 Scratch-off Simulator
 * Robust Version for Reliable Winning Actions
 */

class ScratchEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.isDrawing = false;
        this.options = {
            brushSize: 45, // 브러시 크기 확대
            threshold: 40, // 40%만 긁어도 자동 공개
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
        this.canvas.width = rect.width || 300;
        this.canvas.height = rect.height || 180;
    }

    fill() {
        const { ctx, canvas } = this;
        // Silver background
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid Pattern for more texture
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 5) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        
        // Metallic Sheen
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(255,255,255,0.4)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(255,255,255,0.4)');
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
                // 실시간 체크 (너무 자주 하면 성능 저하되므로 10번 중 1번꼴로)
                if (Math.random() < 0.1) this.checkScratched();
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
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.options.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
    }

    checkScratched() {
        if (!this.canvas.width || !this.canvas.height) return;

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparent = 0;

        // 알파 채널이 150 미만(약 60% 이상 투명)이면 긁힌 것으로 간주
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 150) transparent++;
        }

        const percentage = (transparent / (pixels.length / 4)) * 100;
        console.log(`Scratched: ${percentage.toFixed(2)}%`);

        if (percentage > this.options.threshold) {
            this.revealAll();
            this.options.onThresholdMet();
        }
    }

    revealAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isDrawing = false; // 더 이상 긁기 방지
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
        this.modalClose.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            // 모달 닫을 때 꽃가루 정리
            document.querySelectorAll('.confetti').forEach(el => el.remove());
        });
        this.startNewGame();
    }

    startNewGame() {
        console.log('Starting new game...');
        this.isFinished = false;
        this.generateNumbers();
        this.renderNumbers();
        
        // 캔버스 초기화
        const canvas = document.getElementById('scratch-canvas');
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over'; // 원래대로 복구
        
        new ScratchEngine('scratch-canvas', {
            onThresholdMet: () => this.handleFinish()
        });
    }

    generateNumbers() {
        this.luckyNumber = Math.floor(Math.random() * 30) + 1;
        
        this.myNumbers = Array.from({ length: 6 }, () => {
            const num = Math.floor(Math.random() * 30) + 1;
            // 당첨 확률 30%로 상향 (테스트 용이성)
            const forceWin = Math.random() < 0.3;
            const finalNum = forceWin ? this.luckyNumber : num;
            
            const prizeIdx = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * this.prizes.length);
            
            return {
                val: finalNum,
                prize: this.prizes[prizeIdx],
                isWin: finalNum === this.luckyNumber
            };
        });
        console.log('Lucky Number:', this.luckyNumber);
    }

    renderNumbers() {
        this.luckyEl.innerHTML = `<span>${this.luckyNumber}</span>`;
        this.myEl.innerHTML = this.myNumbers.map(n => `
            <div class="number-cell">
                <span class="val">${n.val}</span>
                <span class="prize">${n.prize}</span>
            </div>
        `).join('');
    }

    handleFinish() {
        if (this.isFinished) return;
        this.isFinished = true;
        console.log('Game Finished! Checking wins...');

        const cells = this.myEl.querySelectorAll('.number-cell');
        const wins = this.myNumbers.filter(n => n.isWin);

        this.myNumbers.forEach((n, i) => {
            if (n.isWin) {
                cells[i].classList.add('winner');
            }
        });

        if (wins.length > 0) {
            console.log('Winning action triggered!');
            this.fireConfetti();
            const prizeText = wins.map(w => w.prize).join(' + ');
            setTimeout(() => this.showWinModal(prizeText), 1000);
        }
    }

    fireConfetti() {
        const colors = ['#e60012', '#f9d900', '#231815', '#ffffff', '#ffeb3b', '#4caf50', '#2196f3'];
        
        // 1. Center Blast
        for (let i = 0; i < 100; i++) {
            this.createConfettiPiece(window.innerWidth / 2, window.innerHeight / 2, true);
        }

        // 2. Continuous Rain
        const rainInterval = setInterval(() => {
            if (!this.isFinished) {
                clearInterval(rainInterval);
                return;
            }
            this.createConfettiPiece(Math.random() * window.innerWidth, -20, false);
        }, 50);

        // 5초 후 비 멈춤
        setTimeout(() => clearInterval(rainInterval), 5000);
    }

    createConfettiPiece(x, y, isBlast) {
        const colors = ['#e60012', '#f9d900', '#231815', '#ffffff', '#ffeb3b', '#4caf50', '#2196f3'];
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        if (Math.random() > 0.5) confetti.style.borderRadius = '50%';
        
        document.body.appendChild(confetti);

        const destX = isBlast ? (Math.random() - 0.5) * window.innerWidth * 1.5 : (Math.random() - 0.5) * 200;
        const destY = isBlast ? (Math.random() - 0.5) * window.innerHeight * 1.5 : window.innerHeight + 20;

        confetti.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 1000}deg)`, opacity: 0 }
        ], {
            duration: isBlast ? 1500 + Math.random() * 1000 : 3000 + Math.random() * 2000,
            easing: isBlast ? 'cubic-bezier(0, .9, .57, 1)' : 'linear',
            fill: 'forwards'
        }).onfinish = () => confetti.remove();
    }

    showWinModal(prize) {
        document.getElementById('win-message').textContent = `당첨금: ${prize}`;
        this.modal.classList.remove('hidden');
    }
}

window.addEventListener('load', () => {
    new SpeettoGame();
});

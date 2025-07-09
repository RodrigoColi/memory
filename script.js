const GRID_SIZE = 6

const grid = document.querySelector('.grid');
const movesElement = document.querySelector('.moves');
let cardsTurned = 0;
let moves = 0;
let score = 0;
let cards = [];

let timer = null;

const ids = Array.from({ length: GRID_SIZE }, (_, i) => i + 1); 
const cardIds = [...ids, ...ids]; 

cardIds.sort(() => Math.random() - 0.5); 

function startGame() {
    grid.innerHTML = '';
    moves = 0;
    score = 0;
    cards = [];
    cardsTurned = 0;
    elapsedSeconds = 0;
    remainingSeconds = 5 * 60;
    movesElement.innerHTML = `Movimentos: ${moves}`;
    timerElement.textContent = formatTime(remainingSeconds);

    const ids = Array.from({ length: GRID_SIZE }, (_, i) => i + 1); 
    const cardIds = [...ids, ...ids]; 
    cardIds.sort(() => Math.random() - 0.5); 

    cardIds.forEach(id => {
        const cardHTML = `
            <div class="card flipped" data-id="${id}">
                <div class="card-inner">
                    <div class="card-front">
                        <img class="faesa-card-image" width="150px" height="auto" src="images/faesa.png">
                    </div>
                    <div class="card-back">
                        <img class="card-content" src="images/image-${id}.png" alt="Image" />
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('flipped');
        });
    }, 3000);

    timer = setInterval(() => {
        remainingSeconds--;
        elapsedSeconds++;
        timerElement.textContent = formatTime(remainingSeconds);

        if (remainingSeconds <= 0) {
            clearInterval(timer);
            timerElement.textContent = "Tempo: 00:00";
        }
    }, 1000);
}

function showStartScreen() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    grid.innerHTML = '';
    moves = 0;
    score = 0;
    cards = [];
    cardsTurned = 0;
    elapsedSeconds = 0;
    remainingSeconds = 5 * 60;
    movesElement.innerHTML = `Movimentos: ${moves}`;
    timerElement.textContent = formatTime(remainingSeconds);

    document.querySelectorAll('.name-input, .start-screen').forEach(el => el.remove());

    const startScreen = document.createElement('div');
    startScreen.classList.add('start-screen');

    const image = document.createElement('img');
    image.src = 'images/faesa.png';
    image.alt = 'FAESA';
    image.classList.add('start-image');

    const startButton = document.createElement('button');
    startButton.textContent = 'Começar Jogo';
    startButton.classList.add('confirm-button');
    startButton.addEventListener('click', () => {
        document.body.removeChild(startScreen);
        startGame();
    });

    startScreen.appendChild(image);
    startScreen.appendChild(startButton);
    document.body.appendChild(startScreen);
}

function renderRankings() {
    const rankingMovesDivs = document.querySelectorAll(".ranking-entry-moves");
    const rankingTimeDivs = document.querySelectorAll(".ranking-entry-time");

    let rankingMoves = JSON.parse(localStorage.getItem("ranking_moves")) || [];
    let rankingTime = JSON.parse(localStorage.getItem("ranking_time")) || [];

    rankingMoves.forEach((entry, index) => {
        if (rankingMovesDivs[index]) {
            rankingMovesDivs[index].textContent = `${entry.nome} - ${entry.movimentos} movimentos`;
        }
    });

    rankingTime.forEach((entry, index) => {
        if (rankingTimeDivs[index]) {
            rankingTimeDivs[index].textContent = `${entry.nome} - ${entry.tempo}`;
        }
    });
}

function updateRankings(nome, movimentos, tempo) {
    let rankingMoves = JSON.parse(localStorage.getItem("ranking_moves")) || [];
    rankingMoves.push({ nome, movimentos });
    rankingMoves.sort((a, b) => a.movimentos - b.movimentos);
    rankingMoves = rankingMoves.slice(0, 5);
    localStorage.setItem("ranking_moves", JSON.stringify(rankingMoves));
    let rankingTime = JSON.parse(localStorage.getItem("ranking_time")) || [];
    rankingTime = rankingTime.map(entry => {
        if (entry.seconds === undefined) {
            const [min, sec] = entry.tempo.split(':').map(Number);
            entry.seconds = min * 60 + sec;
        }
        return entry;
    });

    const [min, sec] = tempo.split(':').map(Number);
    const totalSeconds = min * 60 + sec;
    rankingTime.push({ nome, tempo, seconds: totalSeconds });
    rankingTime.sort((a, b) => a.seconds - b.seconds);
    rankingTime = rankingTime.slice(0, 5);
    localStorage.setItem("ranking_time", JSON.stringify(rankingTime));

    renderRankings();
}

document.addEventListener("DOMContentLoaded", () => {
    renderRankings();
    showStartScreen();
});

grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.card');
    if (!card || cardsTurned == 2 || card.classList.contains('flipped')) return;

    card.classList.toggle('flipped');
    cardsTurned++;
    moves++;
    movesElement.innerHTML = `Movimentos: ${moves}`

    cards.push(card);

    if (cardsTurned == 2) {
        setTimeout(async () => {
            if (cards[0].dataset.id != cards[1].dataset.id) {
                cards.forEach((card) => {
                    card.classList.toggle('flipped');
                });
            } else {
                score++;
            }
            if (score == GRID_SIZE) {
                clearInterval(timer);
                const tempo = formatTime(elapsedSeconds).replace("Tempo: ", "");
                const nome = await getName(); 
                updateRankings(nome, moves, tempo);
                setTimeout(showStartScreen, 5000); 
            }
            cards = [];
            cardsTurned = 0;
        }, 1000);
    }
});

let remainingSeconds = 5 * 60;
let elapsedSeconds = 0;
const timerElement = document.querySelector(".timer");

function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `Tempo: ${minutes}:${seconds}`;
}

timerElement.textContent = formatTime(remainingSeconds);

function getName() {
    return new Promise((resolve) => {
        const keyboardContainer = document.createElement('div');
        keyboardContainer.classList.add('name-input');

        const nameDisplay = document.createElement('div');
        nameDisplay.classList.add('name');
        keyboardContainer.appendChild(nameDisplay);

        const keyboard = document.createElement('div');
        keyboard.classList.add('keyboard');

        const rows = [
            ['A','B','C','D','E','F','G','H','I'],
            ['J','K','L','M','N','O','P','Q','R'],
            ['S','T','U','V','W','X','Y','Z']
        ];

        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');

            row.forEach(letter => {
                const letterDiv = document.createElement('div');
                letterDiv.classList.add('letter');
                letterDiv.textContent = letter;
                rowDiv.appendChild(letterDiv);
            });

            keyboard.appendChild(rowDiv);
        });

        const controlsRow = document.createElement('div');
        controlsRow.classList.add('keyboard-row');

        const backspaceButton = document.createElement('button');
        backspaceButton.textContent = 'Backspace';
        backspaceButton.classList.add('backspace-button');
        backspaceButton.addEventListener('click', () => {
            nameDisplay.innerText = nameDisplay.innerText.slice(0, -1);
        });

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.classList.add('confirm-button');
        confirmButton.addEventListener('click', () => {
            const name = nameDisplay.innerText.trim();
            if (name.length >= 3) {
                if (name.length >= 15) {
                    resolve(name.substring(0, 10));
                } else {
                    resolve(name);
                }
                document.body.removeChild(keyboardContainer); 
            }
        });

        controlsRow.appendChild(backspaceButton);
        controlsRow.appendChild(confirmButton);
        keyboard.appendChild(controlsRow);

        keyboardContainer.appendChild(keyboard);
        document.body.appendChild(keyboardContainer);

        keyboard.querySelectorAll('.letter').forEach(letter => {
            letter.addEventListener('click', () => {
                nameDisplay.innerText += letter.textContent;
            });
        });
    });
}

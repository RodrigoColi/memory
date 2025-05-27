const grid = document.querySelector('.grid');
const movesElement = document.querySelector('.moves');
let cardsTurned = 0;
let moves = 0;
let score = 0;
let cards = [];

const ids = Array.from({ length: 8 }, (_, i) => i + 1); // [1, 2, 3, 4, 5, 6, 7, 8]
const cardIds = [...ids, ...ids]; // ... spreads out the values of ids ([1, 2, 3] -> 1, 2, 3) // this line yields [0, 1, 2, 0, 1, 2] for an array of length 3

cardIds.sort(() => Math.random() - 0.5); // shuffles

cardIds.forEach(id => {
    const cardHTML = `
        <div class="card flipped" data-id="${id}">
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img class="card-content" src="images/image-${id}.png" alt="Image" />
                </div>
            </div>
        </div>
    `;
    grid.innerHTML += cardHTML;
});


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
    let cardElements = document.querySelectorAll('.card');

    setTimeout(() => {
        cardElements.forEach((card) => {
            card.classList.toggle('flipped');
        });
    }, 3000);
});

grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || cardsTurned == 2 || card.classList.contains('flipped')) return;

    card.classList.toggle('flipped');
    cardsTurned++;
    moves++;
    movesElement.innerHTML = `Movimentos: ${moves}`

    cards.push(card);

    if (cardsTurned == 2) {
        setTimeout(() => {
            if (cards[0].dataset.id != cards[1].dataset.id) {
                cards.forEach((card) => {
                    card.classList.toggle('flipped');
                });
            } else {
                score++;
                if (score == 8) {
                    clearInterval(timer);
                    const tempo = formatTime(elapsedSeconds).replace("Tempo: ", ""); 
                    updateRankings(prompt("Digite seu nome: "), moves, tempo);    
                }
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

const timer = setInterval(() => {
    remainingSeconds--;
    elapsedSeconds++;
    timerElement.textContent = formatTime(remainingSeconds);

    if (remainingSeconds <= 0) {
        clearInterval(timer);
        timerElement.textContent = "Tempo: 00:00";
    }
}, 1000);

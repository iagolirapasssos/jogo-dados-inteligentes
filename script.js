const board = document.getElementById('board');
const startGameButton = document.getElementById('startGame');
const playersInput = document.getElementById('players');
const playerNamesDiv = document.getElementById('playerNames');
const submitDiceButton = document.getElementById('submitDice');
const diceResult = document.getElementById('diceResult');
const dice1Input = document.getElementById('dice1');
const dice2Input = document.getElementById('dice2');
const currentPlayerName = document.getElementById('currentPlayerName');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModalButton = document.getElementById('closeModal');
const rankingList = document.getElementById('rankingList');
const rankSection = document.getElementById('rank');

let players = [];
let currentPlayerIndex = 0;
const powers = ["Avançar 2 casas", "Rerrolar os dados", "Bloquear o próximo adversário"];
const failures = ["Voltar 1 casa", "Perde a vez", "Retroceder até o início"];

// Função para criar o tabuleiro com 30 casas
function createBoard() {
    board.innerHTML = ''; // Limpa o tabuleiro anterior
    for (let i = 1; i <= 30; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-number', i);
        cell.innerText = i;

        // Adiciona poderes e fracassos aleatórios, mas sem fracasso na última casa
        const randomNum = Math.random();
        if (randomNum < 0.2) {
            cell.classList.add('power');
            cell.setAttribute('data-power', powers[Math.floor(Math.random() * powers.length)]);
        } else if (randomNum < 0.4 && i < 30) { // Não adiciona fracasso na última casa
            cell.classList.add('failure');
            cell.setAttribute('data-failure', 'fracasso');
        }

        board.appendChild(cell);
    }
}

// Função para adicionar jogadores e seus círculos coloridos
function createPlayers(numPlayers, playerNames) {
    players = [];
    const colors = ['red', 'blue', 'green', 'yellow'];
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            id: i + 1,
            name: playerNames[i],
            position: 0,
            color: colors[i],
            score: 0,
            element: null
        });

        // Adiciona os jogadores na primeira casa
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.style.backgroundColor = colors[i];
        players[i].element = playerElement;
        document.querySelector('[data-cell-number="1"]').appendChild(playerElement);
    }
}

// Função para avançar o jogador
function movePlayer(player, steps) {
    // Remove o jogador da posição atual
    const currentCell = document.querySelector(`[data-cell-number="${player.position}"]`);
    if (currentCell && player.element) {
        currentCell.removeChild(player.element);
    }

    // Atualiza a posição do jogador
    player.position += steps;
    if (player.position > 30) player.position = 30; // Limita o movimento à última casa

    // Move o jogador para a nova posição
    const newCell = document.querySelector(`[data-cell-number="${player.position}"]`);
    newCell.appendChild(player.element);

    // Verifica se a nova casa tem poder ou fracasso
    if (newCell.classList.contains('power')) {
        const power = newCell.getAttribute('data-power');
        showModal(`Você ganhou um poder: ${power}`);
        applyPower(player, power);
    } else if (newCell.classList.contains('failure')) {
        showModal('Você caiu em um fracasso!');
        applyFailure(player);
    }
}

// Função para exibir o modal
function showModal(message) {
    modalMessage.innerText = message;
    modal.classList.add('show');
}

// Função para ocultar o modal
function hideModal() {
    modal.classList.remove('show');
}

// Fecha o modal ao clicar no botão
closeModalButton.addEventListener('click', hideModal);

// Função para aplicar poderes
function applyPower(player, power) {
    switch (power) {
        case "Rerrolar Dados":
            rerollDice();
            break;
        case "Bloquear Avanço do Oponente":
            blockOpponent();
            break;
        case "Trocar Resultados":
            swapResults();
            break;
        case "Avanço Extra":
            movePlayer(player, 2);
            break;
        case "Desafio Duplo":
            // Duplicar o avanço no próximo movimento
            movePlayer(player, player.lastRoll * 2);
            break;
    }
}

// Função para aplicar fracassos
function applyFailure(player) {
    const randomBackSteps = Math.floor(Math.random() * 20) + 1; // Número aleatório entre 1 e 20
    player.position = Math.max(1, player.position - randomBackSteps); // Garantir que não passe da casa 1
    const newCell = document.querySelector(`[data-cell-number="${player.position}"]`);
    newCell.appendChild(player.element);
}

// Simulação da função para rerrolar dados (pode ser expandida)
function rerollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    diceResult.innerText = `Rerrolado: ${dice1} e ${dice2} (Total: ${total})`;

    const currentPlayer = players[currentPlayerIndex];
    movePlayer(currentPlayer, total);
}

// Simulação de bloqueio de avanço de oponente
let isBlocked = false;

function blockOpponent() {
    showModal('Você bloqueou o próximo oponente!');
    isBlocked = true;  // Define a variável para bloquear o próximo jogador
}

function updateCurrentPlayer() {
    if (isBlocked) {
        showModal(`O avanço de ${players[currentPlayerIndex].name} foi bloqueado!`);
        isBlocked = false; // Limpa o bloqueio após o turno do jogador bloqueado
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Pula para o próximo jogador
    }
    currentPlayerName.textContent = `É a vez de: ${players[currentPlayerIndex].name}`;
}


// Simulação de troca de resultados (pode ser expandida)
function swapResults() {
    if (players.length > 1) {
        const previousPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
        const currentPlayer = players[currentPlayerIndex];
        const previousPlayer = players[previousPlayerIndex];

        // Troca as posições entre os dois jogadores
        const tempPosition = currentPlayer.position;
        currentPlayer.position = previousPlayer.position;
        previousPlayer.position = tempPosition;

        // Atualiza a visualização
        movePlayer(currentPlayer, 0);  // Atualiza a posição sem mover
        movePlayer(previousPlayer, 0);  // Atualiza a posição sem mover

        showModal(`Você trocou suas posições com ${previousPlayer.name}!`);
        updateRanking();
    }
}


// Fecha o modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Função para inicializar o jogo
// Função para inicializar o jogo
startGameButton.addEventListener('click', () => {
    const numPlayers = parseInt(playersInput.value);

    // Exibe os campos para adicionar nomes dos jogadores
    playerNamesDiv.innerHTML = '';
    for (let i = 1; i <= numPlayers; i++) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = `Nome do Jogador ${i}`;
        nameInput.id = `playerName${i}`;
        playerNamesDiv.appendChild(nameInput);
    }
    playerNamesDiv.classList.remove('hidden');

    const confirmNamesButton = document.createElement('button');
    confirmNamesButton.textContent = 'Confirmar Nomes';
    confirmNamesButton.addEventListener('click', () => {
        const playerNames = [];
        for (let i = 1; i <= numPlayers; i++) {
            playerNames.push(document.getElementById(`playerName${i}`).value);
        }

        // Cria o tabuleiro e os jogadores com seus nomes
        createBoard();
        createPlayers(numPlayers, playerNames);
        playerNamesDiv.classList.add('hidden');
        board.classList.remove('hidden');
        document.getElementById('player-info').classList.remove('hidden');
        rankSection.classList.remove('hidden');
        updateCurrentPlayer();
        updateRanking();
    });
    playerNamesDiv.appendChild(confirmNamesButton);
});

// Função para atualizar o ranking
function updateRanking() {
    players.sort((a, b) => b.position - a.position); // Ordena pelo maior progresso no tabuleiro
    rankingList.innerHTML = '';
    players.forEach(player => {
        const listItem = document.createElement('li');

        // Cria o círculo colorido representando o jogador
        const playerCircle = document.createElement('div');
        playerCircle.classList.add('player-circle');
        playerCircle.style.backgroundColor = player.color;

        // Adiciona o círculo e o nome do jogador
        listItem.appendChild(playerCircle);
        listItem.textContent = `${player.name}: Casa ${player.position}`;
        rankingList.appendChild(listItem);
    });
}

// Função para enviar valores dos dados e mover o jogador
// Impede valores fora do intervalo 1 a 6
function validateDiceInput(dice1, dice2) {
    if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
        alert('Os valores dos dados devem estar entre 1 e 6.');
        return false;
    }
    return true;
}

// Função para enviar valores dos dados e mover o jogador
submitDiceButton.addEventListener('click', () => {
    const dice1 = parseInt(dice1Input.value);
    const dice2 = parseInt(dice2Input.value);

    // Validação dos dados
    if (!validateDiceInput(dice1, dice2)) {
        return; // Impede o avanço se a validação falhar
    }

    const total = dice1 + dice2;
    diceResult.innerText = `Resultado dos Dados: ${dice1} e ${dice2} (Total: ${total})`;

    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.lastRoll = total; // Armazena o último lançamento
    movePlayer(currentPlayer, total);

    // Limpa os inputs de dados
    dice1Input.value = '';
    dice2Input.value = '';

    // Atualiza o ranking
    updateRanking();

    // Troca para o próximo jogador
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
});

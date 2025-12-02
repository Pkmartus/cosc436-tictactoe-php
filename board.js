const boardContainer = document.getElementById('main-game-board');

// Global state variables
let isCurrentUsersTurn = false;
let isGameOver = false;
let currentBoardState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let currentUserMoveChar = 'Unknown'; // To be set when joining/creating game


/**
 * Applies a move received from the server to the board state,
 * updates the display, and flips the turn indicator.
 *
 * @param {string} screenname - Who made the move
 * @param {number} cell - Cell number 1–9
 */
function applyMoveToBoard(screenname, cell) {

    // Convert cell number (1–9) → row/col
    const x = Math.floor((cell - 1) / 3);
    const y = (cell - 1) % 3;

    // Determine symbol based on who played
    let symbol;
    if (screenname === userScreenName) {
        symbol = currentUserMoveChar;   // X or O
    } else {
        symbol = (currentUserMoveChar === "X") ? "O" : "X";
    }

    // Update internal board
    updateBoardState(x, y, symbol);

    // Redraw board
    displayBoard(currentBoardState);

    // Flip turns
    isCurrentUsersTurn = (screenname !== userScreenName);

    // Check for win/draw
    checkGameState(currentBoardState);
}

/**
 * Converts board coordinates to a cell number (1–9)
 * Layout:
 *  1 2 3
 *  4 5 6
 *  7 8 9
 * @param {number} x - Row index
 * @param {number} y - Column index
 * @returns {number} Cell number (1–9)
 */
function toCellNumber(x, y) {
    return x * 3 + y + 1;
}

/**
 * Handles a player's move: sends move message to server.
 * Sends:
 * {
 *    screenname: userScreenName,
 *    cell: 1-9
 * }
 */
function handleMove(x, y, char) {
    const cellNumber = toCellNumber(x, y);

    sendToServer("MOVE", {
        screenname: userScreenName,
        cell: cellNumber
    });
}


/**
 * Checks if a specific board cell is empty (valid move location)
 * @param {number} x - Row index (0–2)
 * @param {number} y - Column index (0–2)
 * @returns {boolean} True if the cell is empty, false otherwise
 */
function isBoardCellEmpty(x, y) {
    if (x < 0 || x > 2 || y < 0 || y > 2) return false;
    return currentBoardState[x][y] === '';
}

/**
 * Updates the internal game board state with the provided character
 * @param {number} x - Row index (0–2)
 * @param {number} y - Column index (0–2)
 * @param {string} char - 'X' or 'O'
 */
function updateBoardState(x, y, char) {
    currentBoardState[x][y] = char;
}

/**
 * Creates/updates the current game board on the screen
 * @param {string[][]} board - 2D array of 'X', 'O', or ''
 */
function displayBoard(board) {
    boardContainer.innerHTML = ""; // Clear current board

    const table = document.createElement('table');
    table.classList.add('tic-tac-toe-board');

    for (let row = 0; row < 3; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < 3; col++) {
            const td = document.createElement('td');
            td.classList.add('cell');

            td.textContent = board[row][col] || '';

            td.style.pointerEvents = 'auto'; //make sure pointer events get reenabled

            if (board[row][col] === 'X') {
                td.classList.add('x-symbol');
            } else if (board[row][col] === 'O') {
                td.classList.add('o-symbol');
            }

            td.addEventListener('click', () => {
                if (!isGameOver && isCurrentUsersTurn && isBoardCellEmpty(row, col))
                    handleMove(row, col, currentUserMoveChar);
            });

            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    boardContainer.appendChild(table);
}

/**
 * Evaluates the current board to determine if the game has a winner,
 * an early draw (no possible winning lines remain), or should continue.
 *
 * Checks:
 *  - All winning lines (rows, columns, diagonals) for 3 matching symbols
 *  - Early draw condition: if every line contains both X and O, no win is possible
 *
 * @param {string[][]} board - 3×3 array representing the current game state
 * @returns {Object} Game state result:
 *   { status: "win", winner: "X" | "O" }
 *   { status: "draw" }
 *   { status: "ongoing" }
 */
function checkGameState(board) {
    if (isGameOver) return; // Avoid re-checking

    const lines = [
        // Rows
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],

        // Columns
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],

        // Diagonals
        [board[0][0], board[1][1], board[2][2]],
        [board[0][2], board[1][1], board[2][0]],
    ];

    // Check for a win
    for (const line of lines) {
        if (line[0] !== '' && line[0] === line[1] && line[1] === line[2]) {
            isGameOver = true;
            isCurrentUsersTurn = false;

            sendToServer("END-GAME", { winner: line[0], screenname: userScreenName });
            return { status: "win", winner: line[0] };
        }
    }

    // Determine whose turn it is
    const currentPlayer = isCurrentUsersTurn ? currentUserMoveChar : (currentUserMoveChar === "X" ? "O" : "X");
    const opponent = currentPlayer === "X" ? "O" : "X";

    // Early draw detection
    let anyPossibleWin = false;

    for (const line of lines) {
        const hasCurrent = line.includes(currentPlayer);
        const hasOpponent = line.includes(opponent);

        // The line is winnable ONLY if it contains no opponent marks
        if (!hasOpponent) {
            anyPossibleWin = true;
            break;
        }
    }

    if (!anyPossibleWin) {
        // Early draw
        isGameOver = true;
        isCurrentUsersTurn = false;

        sendToServer("END-GAME", { winner: "D", screenname: userScreenName });
        return { status: "draw" };
    }

    return { status: "ongoing" };
}

//get an array of all cells in the table, disable the listener on all of them
function disableListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
}
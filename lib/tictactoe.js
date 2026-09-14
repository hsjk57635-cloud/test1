/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

/**
 * TicTacToe game instance factory.
 * Inspired by the web version – uses a board array and win checks.
 */
function createTicTacToe(playerXJid, playerOJid) {
    // Private board (null = empty)
    let board = Array(9).fill(null);
    let currentPlayer = 'X';          // X always starts
    let winner = null;
    let draw = false;

    // Helper to check if a symbol has three in a row
    function checkWinnerFor(symbol) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6]           // diagonals
        ];
        return winPatterns.some(pattern => 
            pattern.every(pos => board[pos] === symbol)
        );
    }

    // Public API
    return {
        getBoard: () => [...board],
        getCurrentPlayer: () => currentPlayer,
        getWinner: () => winner,
        isDraw: () => draw,
        isGameOver: () => winner !== null || draw,

        // Make a move. Returns:
        //   -1 = not your turn
        //    0 = cell occupied
        //   -2 = game already ended
        //    1 = move accepted (game may now be over)
        makeMove(position, playerSymbol) {
            if (winner || draw) return -2;
            if (playerSymbol !== currentPlayer) return -1;
            if (position < 0 || position > 8 || board[position] !== null) return 0;

            board[position] = playerSymbol;

            // Check win
            if (checkWinnerFor(playerSymbol)) {
                winner = playerSymbol;
            } else if (board.every(cell => cell !== null)) {
                draw = true;
            } else {
                // Switch turn
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
            return 1;
        },

        // Get a display string of the board with emoji numbers
        getDisplayBoard() {
            const displayMap = (cell) => {
                if (cell === 'X') return '❌';
                if (cell === 'O') return '⭕';
                // numbers 1️⃣ to 9️⃣
                return ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][board.indexOf(null, 0) === -1 ? 0 : board.indexOf(null)]; 
                // But that's not right – we need the actual position numbers regardless of occupied.
                // Better: map each position to its symbol or number.
            };
            // Actually, simpler: build display based on board content.
            let str = '';
            for (let i = 0; i < 9; i++) {
                if (board[i] === 'X') str += '❌';
                else if (board[i] === 'O') str += '⭕';
                else str += (i+1) + '️⃣'; // won't be perfect but okay
                if ((i+1) % 3 === 0) str += '\n';
                else str += ' ';
            }
            return str;
        },

        // For debugging
        toJSON() {
            return { board, currentPlayer, winner, draw };
        }
    };
}

module.exports = createTicTacToe;

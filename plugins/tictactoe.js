/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic Class ====================
class TicTacToe {
    constructor(playerX = null, playerO = null) {
        this.playerX = playerX;
        this.playerO = playerO;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X always starts
        this.winner = null;
        this.draw = false;
    }

    makeMove(position, player) {
        if (this.winner || this.draw) return -2;
        if (player !== this.currentPlayer) return -1;
        if (position < 0 || position > 8 || this.board[position] !== null) return 0;

        this.board[position] = player;
        this.checkGameStatus();
        if (!this.winner && !this.draw) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        return 1;
    }

    checkGameStatus() {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];
        for (let pattern of winPatterns) {
            const [a,b,c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[b] === this.board[c]) {
                this.winner = this.board[a];
                return;
            }
        }
        if (this.board.every(cell => cell !== null)) {
            this.draw = true;
        }
    }

    getDisplayBoard() {
        const numEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
        const symbols = this.board.map((cell, i) => 
            cell === 'X' ? '❌' : cell === 'O' ? '⭕' : numEmoji[i]
        );
        let str = '';
        for (let i = 0; i < 9; i += 3) {
            str += symbols[i] + ' ' + symbols[i+1] + ' ' + symbols[i+2] + '\n';
        }
        return str;
    }
}

// ==================== Game Storage ====================
const games = new Map(); // key = `${chatId}:${roomName}`

// ==================== Plugin ====================
module.exports = {
    command: 'tictactoe',
    aliases: ['ttt', 'xo'],
    category: 'games',
    description: 'Play TicTacToe with another user. Use rooms to have multiple games.',
    usage: 
        '.ttt <room>                – Create or join a game in that room\n' +
        '.ttt select <1-9>          – Place your mark on the board\n' +
        '.ttt surrender              – Give up current game\n' +
        '.ttt guide                   – Show this help',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        try {
            const chatId = context.chatId || message.key.remoteJid;
            const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
            const channelInfo = context.channelInfo || {};

            const reply = async (text, mentions = []) => 
                await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

            if (args.length === 0) {
                return await reply(
                    `🎮 *TicTacToe Commands*\n\n` +
                    `• \`.ttt <room>\` – Create or join a game in that room\n` +
                    `• \`.ttt select <1-9>\` – Place your mark\n` +
                    `• \`.ttt surrender\` – Give up\n` +
                    `• \`.ttt guide\` – Show this help`
                );
            }

            const subCmd = args[0].toLowerCase();

            // ----- GUIDE -----
            if (subCmd === 'guide') {
                return await reply(
                    `📖 *TicTacToe Guide*\n\n` +
                    `1. Start a game: \`.ttt default\` (or any room name)\n` +
                    `2. Another player joins with the same room name\n` +
                    `3. Use \`.ttt select <number>\` to place your mark\n` +
                    `4. Numbers correspond to positions:\n` +
                    `   1️⃣ 2️⃣ 3️⃣\n` +
                    `   4️⃣ 5️⃣ 6️⃣\n` +
                    `   7️⃣ 8️⃣ 9️⃣\n` +
                    `5. Type \`.ttt surrender\` to give up\n` +
                    `6. The game ends when someone wins or it's a draw`
                );
            }

            // ----- SURRENDER -----
            if (subCmd === 'surrender') {
                for (let [key, game] of games.entries()) {
                    if (!key.startsWith(chatId)) continue;
                    const players = [game.playerX, game.playerO].filter(p => p);
                    if (players.includes(senderId) && !game.winner && !game.draw) {
                        const opponent = players.find(p => p !== senderId);
                        const result = opponent 
                            ? `@${opponent.split('@')[0]} wins by surrender! 🏆`
                            : `Game ended.`;
                        game.winner = opponent ? (game.playerX === opponent ? 'X' : 'O') : null;
                        game.draw = false;
                        await reply(
                            `🏳️ @${senderId.split('@')[0]} surrendered!\n\n${result}`,
                            opponent ? [senderId, opponent] : [senderId]
                        );
                        games.delete(key);
                        return;
                    }
                }
                return await reply('❌ You are not in any active game.');
            }

            // ----- SELECT MOVE -----
            if (subCmd === 'select') {
                if (args.length < 2) return await reply('❌ Please provide a number: `.ttt select 1`');
                const moveNum = parseInt(args[1]);
                if (isNaN(moveNum) || moveNum < 1 || moveNum > 9) {
                    return await reply('❌ Please enter a number between 1 and 9.');
                }

                let currentGame = null;
                let currentKey = null;
                for (let [key, game] of games.entries()) {
                    if (!key.startsWith(chatId)) continue;
                    const players = [game.playerX, game.playerO].filter(p => p);
                    if (players.includes(senderId) && !game.winner && !game.draw) {
                        currentGame = game;
                        currentKey = key;
                        break;
                    }
                }
                if (!currentGame) return await reply('❌ You are not in an active game. Start one with `.ttt <room>`');

                const playerSymbol = currentGame.playerX === senderId ? 'X' : 'O';
                const result = currentGame.makeMove(moveNum - 1, playerSymbol);

                if (result === -1) return await reply('❌ Not your turn!');
                if (result === 0) return await reply('❌ That position is already taken!');
                if (result === -2) return await reply('❌ Game already ended.');

                const boardDisplay = currentGame.getDisplayBoard();
                let status = '';
                let gameEnded = false;

                if (currentGame.winner) {
                    const winnerId = currentGame.winner === 'X' ? currentGame.playerX : currentGame.playerO;
                    status = `🎉 @${winnerId.split('@')[0]} wins!`;
                    gameEnded = true;
                } else if (currentGame.draw) {
                    status = `🤝 It's a draw!`;
                    gameEnded = true;
                } else {
                    const nextId = currentGame.currentPlayer === 'X' ? currentGame.playerX : currentGame.playerO;
                    status = `It's @${nextId.split('@')[0]}'s turn (${currentGame.currentPlayer === 'X' ? '❌' : '⭕'}).`;
                }

                const players = [currentGame.playerX, currentGame.playerO].filter(p => p);
                await reply(
                    `🎮 *TicTacToe*\n\n${boardDisplay}\n\n${status}`,
                    players
                );

                if (gameEnded) {
                    games.delete(currentKey);
                }
                return;
            }

            // ----- CREATE/JOIN ROOM -----
            const roomName = subCmd;
            const key = `${chatId}:${roomName}`;
            let game = games.get(key);

            if (!game) {
                const newGame = new TicTacToe(senderId, null);
                games.set(key, newGame);
                return await reply(
                    `🎮 *TicTacToe room created*\n\n` +
                    `Room: *${roomName}*\n` +
                    `Waiting for opponent...\n` +
                    `Another player can join with: \`.ttt ${roomName}\`\n\n` +
                    `Player ❌: @${senderId.split('@')[0]}`,
                    [senderId]
                );
            }

            const players = [game.playerX, game.playerO].filter(p => p);
            if (players.includes(senderId)) {
                return await reply('❌ You are already in this game. Make a move with `.ttt select <number>`');
            }

            if (players.length === 2) {
                return await reply('❌ This room is full. Finish the current game first.');
            }

            // Join as O
            game.playerO = senderId;
            const boardDisplay = game.getDisplayBoard();
            const allPlayers = [game.playerX, game.playerO];
            await reply(
                `🎮 *TicTacToe Game Started!*\n\n` +
                `${boardDisplay}\n\n` +
                `❌: @${game.playerX.split('@')[0]}\n` +
                `⭕: @${game.playerO.split('@')[0]}\n\n` +
                `It's @${game.playerX.split('@')[0]}'s turn (❌).\n` +
                `Use \`.ttt select <number>\` to play.`,
                allPlayers
            );

        } catch (error) {
            console.error('[TTT Plugin Error]', error);
            const chatId = message.key.remoteJid;
            await sock.sendMessage(chatId, {
                text: `❌ An internal error occurred in TicTacToe: ${error.message}`
            }, { quoted: message });
        }
    }
};

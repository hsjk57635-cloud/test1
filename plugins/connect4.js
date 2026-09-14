/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

// plugins/connect4.js
const games = new Map();

function createBoard() {
    return Array(6).fill().map(() => Array(7).fill('⚪'));
}

function displayBoard(board) {
    let str = '```\n 1 2 3 4 5 6 7\n';
    for (let r = 0; r < 6; r++) {
        str += '|';
        for (let c = 0; c < 7; c++) {
            str += board[r][c] + '|';
        }
        str += '\n';
    }
    str += '```';
    return str;
}

function dropPiece(board, col, piece) {
    for (let r = 5; r >= 0; r--) {
        if (board[r][col] === '⚪') {
            board[r][col] = piece;
            return r;
        }
    }
    return -1;
}

function checkWinner(board, row, col, piece) {
    const directions = [[1,0], [0,1], [1,1], [1,-1]];
    for (const [dr, dc] of directions) {
        let count = 1;
        // positive direction
        for (let i = 1; i < 4; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || board[nr][nc] !== piece) break;
            count++;
        }
        // negative direction
        for (let i = 1; i < 4; i++) {
            const nr = row - dr * i, nc = col - dc * i;
            if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || board[nr][nc] !== piece) break;
            count++;
        }
        if (count >= 4) return true;
    }
    return false;
}

function isBoardFull(board) {
    return board[0].every(cell => cell !== '⚪');
}

module.exports = {
    command: 'connect4',
    aliases: ['c4'],
    category: 'games',
    description: 'Play Connect 4 with a friend. Choose column 1-7 to drop your piece.',
    usage: '.connect4 [room name]',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const roomName = args.join(' ').trim() || 'default';

        // Check if sender already in a game
        for (let [id, game] of games.entries()) {
            if (game.players.includes(senderId) && game.state !== 'finished') {
                return await sock.sendMessage(chatId, {
                    text: `❌ You are already in a game (Room: ${game.roomName}). Finish or surrender first.`
                }, { quoted: message });
            }
        }

        // Look for waiting room
        let roomId = null;
        let game = null;
        for (let [id, g] of games.entries()) {
            if (g.state === 'waiting' && g.roomName === roomName && g.players.length === 1) {
                roomId = id;
                game = g;
                break;
            }
        }

        if (game) {
            // Join existing room
            game.players.push(senderId);
            game.state = 'playing';
            game.pieces = { [game.players[0]]: '🔴', [game.players[1]]: '🟡' };
            game.turn = game.players[0]; // first player starts

            const boardDisplay = displayBoard(game.board);
            const str = `🎮 *Connect 4 Game Started!*\n\nRoom: ${game.roomName}\n\n${boardDisplay}\n\n🔴: @${game.players[0].split('@')[0]}\n🟡: @${game.players[1].split('@')[0]}\n\nIt's @${game.players[0].split('@')[0]}'s turn (🔴).\nSend a column number 1-7 to drop your piece.`;

            await sock.sendMessage(chatId, {
                text: str,
                mentions: game.players
            }, { quoted: message });

            if (game.chatId !== chatId) {
                await sock.sendMessage(game.chatId, {
                    text: str,
                    mentions: game.players
                });
            }
        } else {
            // Create new room
            const newGame = {
                board: createBoard(),
                players: [senderId],
                roomName,
                chatId: chatId,
                state: 'waiting',
                createdAt: Date.now()
            };
            const newRoomId = `c4-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            games.set(newRoomId, newGame);

            await sock.sendMessage(chatId, {
                text: `🎮 *Connect 4 Room Created*\n\nRoom: ${roomName}\n\nWaiting for opponent...\n\nType \`.connect4 ${roomName}\` to join this game.\n\nPlayer 🔴: @${senderId.split('@')[0]}`,
                mentions: [senderId]
            }, { quoted: message });
        }
    },

    async handleMove(sock, message, chatId, senderId, text) {
        const room = Array.from(games.values()).find(g =>
            g.players.includes(senderId) &&
            g.state === 'playing'
        );
        if (!room) return false;

        if (text.toLowerCase() === 'surrender' || text.toLowerCase() === 'giveup') {
            const winner = room.players.find(p => p !== senderId);
            room.state = 'finished';
            const str = `🏳️ @${senderId.split('@')[0]} surrendered!\n\n🎉 @${winner.split('@')[0]} wins!`;
            await sock.sendMessage(chatId, {
                text: str,
                mentions: [senderId, winner]
            }, { quoted: message });
            if (room.chatId !== chatId) {
                await sock.sendMessage(room.chatId, {
                    text: str,
                    mentions: [senderId, winner]
                });
            }
            games.delete(Array.from(games.entries()).find(([k,v]) => v === room)[0]);
            return true;
        }

        const col = parseInt(text, 10) - 1;
        if (isNaN(col) || col < 0 || col > 6) return false;

        if (senderId !== room.turn) {
            await sock.sendMessage(chatId, { text: '❌ Not your turn!' }, { quoted: message });
            return true;
        }

        const piece = room.pieces[senderId];
        const row = dropPiece(room.board, col, piece);
        if (row === -1) {
            await sock.sendMessage(chatId, { text: '❌ That column is full!' }, { quoted: message });
            return true;
        }

        const winner = checkWinner(room.board, row, col, piece);
        const boardDisplay = displayBoard(room.board);

        if (winner) {
            room.state = 'finished';
            const str = `🎉 *Game Over!*\n\n${boardDisplay}\n\nCongratulations @${senderId.split('@')[0]}! You win! 🏆`;
            await sock.sendMessage(chatId, {
                text: str,
                mentions: room.players
            }, { quoted: message });
            if (room.chatId !== chatId) {
                await sock.sendMessage(room.chatId, {
                    text: str,
                    mentions: room.players
                });
            }
            games.delete(Array.from(games.entries()).find(([k,v]) => v === room)[0]);
            return true;
        }

        if (isBoardFull(room.board)) {
            room.state = 'finished';
            const str = `🤝 *It's a draw!*\n\n${boardDisplay}`;
            await sock.sendMessage(chatId, {
                text: str,
                mentions: room.players
            }, { quoted: message });
            if (room.chatId !== chatId) {
                await sock.sendMessage(room.chatId, {
                    text: str,
                    mentions: room.players
                });
            }
            games.delete(Array.from(games.entries()).find(([k,v]) => v === room)[0]);
            return true;
        }

        // Switch turn
        room.turn = room.players.find(p => p !== senderId);
        const nextPlayer = room.turn;
        const nextPiece = room.pieces[nextPlayer];
        const str = `${boardDisplay}\n\nIt's @${nextPlayer.split('@')[0]}'s turn (${nextPiece}).\nSend a column 1-7.`;

        await sock.sendMessage(chatId, {
            text: str,
            mentions: [nextPlayer]
        }, { quoted: message });

        if (room.chatId !== chatId) {
            await sock.sendMessage(room.chatId, {
                text: str,
                mentions: [nextPlayer]
            });
        }
        return true;
    }
};

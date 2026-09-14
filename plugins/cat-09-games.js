'use strict';
// AUTO-GENERATED BUNDLE: cat-09-games
// Contains: hangman.js, trivia.js, tictactoe.js, sudoku.js, blackjack.js, rps.js, guess.js, wordle.js, connect4.js, minesweeper.js, twenty48.js, battleship.js, memorypuzzle.js, rpg.js, rpg-ultra.js, towerdefense.js, slot.js, roll.js, dice.js, coin.js, game.js, wordcloud.js, wordsearch.js, deline-games.js, deline-requests.js

const _bundle = [];


/* ===== hangman.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
const words = ['apple', 'banana', 'cherry', 'dog', 'elephant', 'flower', 'guitar', 'house', 'ice', 'jungle'];

class Hangman {
    constructor() {
        this.word = words[Math.floor(Math.random() * words.length)].toUpperCase();
        this.guessed = new Set();
        this.remainingAttempts = 6;
        this.gameOver = false;
        this.won = false;
    }

    guess(letter) {
        if (this.gameOver || this.won) return { error: 'Game already ended' };
        letter = letter.toUpperCase();
        if (!/^[A-Z]$/.test(letter)) return { error: 'Please guess a single letter A-Z' };
        if (this.guessed.has(letter)) return { error: 'You already guessed that letter' };

        this.guessed.add(letter);
        if (!this.word.includes(letter)) {
            this.remainingAttempts--;
        }

        // Check win
        const wordLetters = new Set(this.word);
        let allGuessed = true;
        for (let l of wordLetters) {
            if (!this.guessed.has(l)) {
                allGuessed = false;
                break;
            }
        }
        if (allGuessed) {
            this.won = true;
        }

        if (this.remainingAttempts <= 0) {
            this.gameOver = true;
        }

        return { success: true };
    }

    getDisplayBoard() {
        const hangmanStages = [
            '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```'
        ];
        const stage = 6 - this.remainingAttempts;
        let display = hangmanStages[stage] + '\n\nWord: ';
        for (let char of this.word) {
            display += this.guessed.has(char) ? char + ' ' : '_ ';
        }
        display += `\nGuessed: ${Array.from(this.guessed).join(', ')}`;
        display += `\nAttempts left: ${this.remainingAttempts}`;
        return display;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `hangman-${chatId}:${player}`

module.exports = {
    command: 'hangman',
    aliases: ['hm'],
    category: 'games',
    description: 'Guess the word letter by letter.',
    usage: 
        '.hm start                  – Start a new game\n' +
        '.hm guess <letter>          – Guess a letter\n' +
        '.hm guide                    – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🎯 *Hangman Commands*\n\n` +
                `• \`.hm start\` – New game\n` +
                `• \`.hm guess <letter>\` – Guess a letter\n` +
                `• \`.hm guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Hangman Guide*\n\n` +
                `1. Start a game: \`.hm start\`\n` +
                `2. Guess letters one at a time: \`.hm guess a\`\n` +
                `3. Each wrong guess adds a part to the hangman\n` +
                `4. Guess the whole word before the hangman is complete!\n` +
                `5. Letters already guessed are shown.`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`hangman-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new Hangman();
            const newKey = `hangman-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🎯 *Hangman Started!*\n\n${newGame.getDisplayBoard()}\n\nStart guessing with \`.hm guess <letter>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.hm start`');

        if (subCmd === 'guess') {
            if (args.length < 2) return await reply('❌ Usage: `.hm guess <letter>`');
            const letter = args[1];
            const result = game.guess(letter);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (game.won) {
                games.delete(gameKey);
                return await reply(`🎉 *You Win!*\n\nThe word was: ${game.word}\n\n${game.getDisplayBoard()}`);
            }
            if (game.gameOver) {
                games.delete(gameKey);
                return await reply(`💀 *Game Over!* The word was: ${game.word}\n\n${game.getDisplayBoard()}`);
            }

            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.hm guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading hangman.js:', e.message); }

/* ===== trivia.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

// ==================== API Helpers ====================
const BASE_URL = 'https://opentdb.com/api.php';
const CATEGORIES_URL = 'https://opentdb.com/api_category.php';

// Cache categories
let categoriesCache = null;

async function fetchCategories() {
    if (categoriesCache) return categoriesCache;
    try {
        const res = await axios.get(CATEGORIES_URL);
        categoriesCache = res.data.trivia_categories;
        return categoriesCache;
    } catch (e) {
        return [];
    }
}

async function fetchQuestion(categoryId = null, difficulty = null) {
    let url = `${BASE_URL}?amount=1&type=multiple&encode=url3986`;
    if (categoryId) url += `&category=${categoryId}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    const res = await axios.get(url);
    const q = res.data.results[0];
    if (!q) throw new Error('No question returned');
    return {
        question: decodeURIComponent(q.question),
        correct: decodeURIComponent(q.correct_answer),
        incorrect: q.incorrect_answers.map(a => decodeURIComponent(a)),
        category: decodeURIComponent(q.category),
        difficulty: q.difficulty
    };
}

// ==================== Game Class ====================
class TriviaGame {
    constructor(chatId, host, settings = {}) {
        this.chatId = chatId;
        this.host = host;
        this.players = new Map(); // playerId -> { name, score, answers }
        this.settings = {
            rounds: settings.rounds || 5,
            category: settings.category || null,
            difficulty: settings.difficulty || null,
            timeLimit: settings.timeLimit || 30 // seconds per question
        };
        this.state = 'waiting'; // waiting, playing, ended
        this.currentRound = 0;
        this.currentQuestion = null;
        this.questionStartTime = null;
        this.timeout = null;
        this.answers = new Map(); // playerId -> answer text (for current question)
        this.correctAnswer = null;
    }

    addPlayer(playerId, name) {
        if (this.state !== 'waiting') return false;
        if (this.players.has(playerId)) return false;
        this.players.set(playerId, { name, score: 0, answers: [] });
        return true;
    }

    removePlayer(playerId) {
        return this.players.delete(playerId);
    }

    async start() {
        if (this.players.size < 2) throw new Error('Need at least 2 players to start');
        this.state = 'playing';
        return await this.nextQuestion();
    }

    async nextQuestion() {
        if (this.currentRound >= this.settings.rounds) {
            this.state = 'ended';
            return { type: 'end' };
        }
        this.currentRound++;
        this.answers.clear();
        try {
            const q = await fetchQuestion(this.settings.category, this.settings.difficulty);
            this.currentQuestion = q.question;
            this.correctAnswer = q.correct;
            const options = [q.correct, ...q.incorrect].sort(() => Math.random() - 0.5);
            this.questionStartTime = Date.now();
            return {
                type: 'question',
                round: this.currentRound,
                total: this.settings.rounds,
                question: q.question,
                options,
                category: q.category,
                difficulty: q.difficulty
            };
        } catch (e) {
            throw new Error('Failed to fetch question');
        }
    }

    submitAnswer(playerId, answer) {
        if (this.state !== 'playing') return { error: 'Game not in playing state' };
        if (!this.players.has(playerId)) return { error: 'You are not in this game' };
        if (this.answers.has(playerId)) return { error: 'You already answered' };
        if (!this.currentQuestion) return { error: 'No active question' };
        const isCorrect = answer.toLowerCase() === this.correctAnswer.toLowerCase();
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const points = isCorrect ? Math.max(10, Math.floor(100 / timeTaken)) : 0; // points based on speed
        this.answers.set(playerId, { answer, isCorrect, points, timeTaken });
        const player = this.players.get(playerId);
        if (isCorrect) player.score += points;
        player.answers.push({ round: this.currentRound, correct: isCorrect, answer });
        return { isCorrect, points, timeTaken };
    }

    allAnswered() {
        return this.answers.size === this.players.size;
    }

    getRoundResults() {
        const results = [];
        for (let [pid, ans] of this.answers) {
            const player = this.players.get(pid);
            results.push({
                name: player.name,
                ...ans
            });
        }
        return results.sort((a,b) => b.points - a.points);
    }

    getLeaderboard() {
        const leaderboard = [];
        for (let [pid, p] of this.players) {
            leaderboard.push({ name: p.name, score: p.score });
        }
        return leaderboard.sort((a,b) => b.score - a.score);
    }

    getStatus() {
        if (this.state === 'waiting') {
            return `⏳ *Waiting for players*\n\nPlayers: ${Array.from(this.players.values()).map(p => p.name).join(', ') || 'None'}\n\nHost: @${this.host.split('@')[0]}\nUse \`.trivia join\` to join.`;
        } else if (this.state === 'playing') {
            const remaining = this.players.size - this.answers.size;
            const timeElapsed = this.questionStartTime ? Math.floor((Date.now() - this.questionStartTime)/1000) : 0;
            const timeLeft = Math.max(0, this.settings.timeLimit - timeElapsed);
            return `🎯 *Trivia in Progress*\nRound ${this.currentRound}/${this.settings.rounds}\n\n` +
                   `Question: ${this.currentQuestion}\n\n` +
                   `Answered: ${this.answers.size}/${this.players.size}\n` +
                   `Time left: ${timeLeft}s\n` +
                   `Use \`.trivia answer <option>\` to answer.`;
        } else {
            const leaderboard = this.getLeaderboard();
            let msg = `🏆 *Game Over!*\n\nFinal Scores:\n`;
            leaderboard.forEach((p, i) => {
                msg += `${i+1}. ${p.name}: ${p.score} points\n`;
            });
            return msg;
        }
    }
}

// ==================== Storage ====================
const games = new Map(); // key = chatId

// Helper to normalize JID
function normalizeJid(jid) {
    if (!jid) return jid;
    return jid.split(':')[0];
}

module.exports = {
    command: 'trivia',
    aliases: ['quiz'],
    category: 'games',
    description: 'Play a trivia game with friends!',
    usage: 
        '.trivia start [category] [difficulty] [rounds] – Start a new game\n' +
        '.trivia join                                      – Join waiting game\n' +
        '.trivia answer <option>                           – Answer current question\n' +
        '.trivia categories                                 – List available categories\n' +
        '.trivia status                                     – Show game status\n' +
        '.trivia leave                                      – Leave the game\n' +
        '.trivia guide                                       – Show detailed guide',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = normalizeJid(context.senderId || message.key.participant || message.key.remoteJid);
        const senderName = message.pushName || senderId.split('@')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        // Get or create game for this chat
        let game = games.get(chatId);

        // Helper to check if user is host
        const isHost = game && game.host === senderId;

        if (args.length === 0) {
            // Show usage
            return await reply(
                `🎯 *Trivia Commands*\n\n` +
                `• \`.trivia start [category] [difficulty] [rounds]\` – Start a game\n` +
                `• \`.trivia join\` – Join waiting game\n` +
                `• \`.trivia answer <option>\` – Answer question\n` +
                `• \`.trivia categories\` – List categories\n` +
                `• \`.trivia status\` – Current game status\n` +
                `• \`.trivia leave\` – Leave the game\n` +
                `• \`.trivia guide\` – Detailed guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        // ----- GUIDE -----
        if (subCmd === 'guide') {
            return await reply(
                `📖 *Trivia Game Guide*\n\n` +
                `1. Host starts a game: \`.trivia start\` (optional: category, difficulty, rounds)\n` +
                `   Example: \`.trivia start Science easy 5\`\n` +
                `2. Players join with \`.trivia join\`\n` +
                `3. Host starts the game (automatically after all joined)\n` +
                `4. For each question, type \`.trivia answer <option>\` (e.g., \`.trivia answer A\`)\n` +
                `5. Points are awarded based on speed and correctness\n` +
                `6. After all rounds, final scores are shown\n\n` +
                `*Difficulty:* easy, medium, hard\n` +
                `*Categories:* Use \`.trivia categories\` to see list\n` +
                `*Rounds:* Default 5, max 10`
            );
        }

        // ----- CATEGORIES -----
        if (subCmd === 'categories') {
            const cats = await fetchCategories();
            let msg = `📚 *Available Categories*\n\n`;
            cats.slice(0, 20).forEach(c => {
                msg += `• ${c.name} (ID: ${c.id})\n`;
            });
            if (cats.length > 20) msg += `\n... and more. Use category name or ID.`;
            return await reply(msg);
        }

        // ----- START -----
        if (subCmd === 'start') {
            if (game) {
                if (game.state !== 'waiting') {
                    return await reply('❌ A game is already in progress.');
                }
                // Allow restart? We'll delete old game.
                games.delete(chatId);
                game = null;
            }

            // Parse settings
            let category = null;
            let difficulty = null;
            let rounds = 5;

            // Try to parse arguments: .trivia start [category] [difficulty] [rounds]
            // We'll do a simple parser: look for known difficulty words, numbers, and category names/IDs.
            const possibleArgs = args.slice(1);
            for (let arg of possibleArgs) {
                const lower = arg.toLowerCase();
                if (lower === 'easy' || lower === 'medium' || lower === 'hard') {
                    difficulty = lower;
                } else if (!isNaN(parseInt(arg)) && parseInt(arg) > 0 && parseInt(arg) <= 20) {
                    rounds = parseInt(arg);
                } else {
                    // assume it's a category name or ID
                    // We'll store it as string; fetchQuestion will handle by ID if numeric, else name?
                    // Actually API expects category ID. We'll try to match by name.
                    // For simplicity, we'll just store the arg and later try to resolve.
                    // Better: use category name to ID mapping.
                    const cats = await fetchCategories();
                    const found = cats.find(c => c.name.toLowerCase().includes(lower) || c.id.toString() === lower);
                    if (found) category = found.id;
                }
            }

            const newGame = new TriviaGame(chatId, senderId, { category, difficulty, rounds });
            newGame.addPlayer(senderId, senderName);
            games.set(chatId, newGame);

            let msg = `🎯 *Trivia Game Created!*\n\n` +
                     `Host: @${senderName}\n` +
                     `Settings:\n` +
                     `• Rounds: ${rounds}\n` +
                     `• Category: ${category ? (await fetchCategories()).find(c => c.id === category)?.name || 'Any' : 'Any'}\n` +
                     `• Difficulty: ${difficulty || 'Any'}\n\n` +
                     `Players can join with \`.trivia join\`\n` +
                     `Use \`.trivia status\` to see current players.`;
            await reply(msg, [senderId]);
            return;
        }

        if (!game) {
            return await reply('❌ No game in this chat. Start one with `.trivia start`');
        }

        // ----- JOIN -----
        if (subCmd === 'join') {
            if (game.state !== 'waiting') {
                return await reply('❌ Game already started. Wait for the next game.');
            }
            const added = game.addPlayer(senderId, senderName);
            if (!added) {
                return await reply('❌ You are already in the game.');
            }
            await reply(`✅ @${senderName} joined the game! (${game.players.size} players)`, [senderId]);
            return;
        }

        // ----- LEAVE -----
        if (subCmd === 'leave') {
            if (game.state !== 'waiting') {
                return await reply('❌ Cannot leave once game has started.');
            }
            const removed = game.removePlayer(senderId);
            if (!removed) {
                return await reply('❌ You are not in the game.');
            }
            if (game.players.size === 0) {
                games.delete(chatId);
                return await reply('❌ Game deleted (no players left).');
            }
            // If host left, assign new host (first player)
            if (senderId === game.host) {
                const newHost = Array.from(game.players.keys())[0];
                game.host = newHost;
                await reply(`👑 New host: @${game.players.get(newHost).name}`, [newHost]);
            }
            await reply(`❌ @${senderName} left the game.`, [senderId]);
            return;
        }

        // ----- STATUS -----
        if (subCmd === 'status') {
            return await reply(game.getStatus(), Array.from(game.players.keys()));
        }

        // ----- ANSWER -----
        if (subCmd === 'answer') {
            if (game.state !== 'playing') {
                return await reply('❌ No active question. Use `.trivia status` to see game state.');
            }
            if (args.length < 2) {
                return await reply('❌ Usage: `.trivia answer <option>` (e.g., `.trivia answer A`)');
            }
            const answer = args.slice(1).join(' ').trim();
            const result = game.submitAnswer(senderId, answer);
            if (result.error) {
                return await reply(`❌ ${result.error}`);
            }

            // Notify player of result
            if (result.isCorrect) {
                await reply(`✅ Correct! +${result.points} points (${result.timeTaken.toFixed(1)}s)`);
            } else {
                await reply(`❌ Wrong! The correct answer was: ${game.correctAnswer}`);
            }

            // If all answered, proceed to next round
            if (game.allAnswered()) {
                // Show round results
                const results = game.getRoundResults();
                let roundMsg = `📊 *Round ${game.currentRound} Results*\n\n`;
                results.forEach(r => {
                    roundMsg += `${r.name}: ${r.isCorrect ? '✅' : '❌'} +${r.points}pts\n`;
                });
                await reply(roundMsg, Array.from(game.players.keys()));

                // Get next question or end game
                try {
                    const next = await game.nextQuestion();
                    if (next.type === 'end') {
                        // Game over
                        const leaderboard = game.getLeaderboard();
                        let finalMsg = `🏆 *Game Over!*\n\nFinal Scores:\n`;
                        leaderboard.forEach((p, i) => {
                            finalMsg += `${i+1}. ${p.name}: ${p.score} points\n`;
                        });
                        await reply(finalMsg, Array.from(game.players.keys()));
                        games.delete(chatId);
                    } else {
                        // New question
                        const optionsText = next.options.map((opt, i) => `${String.fromCharCode(65+i)}. ${opt}`).join('\n');
                        await reply(
                            `🎯 *Round ${next.round}/${next.total}*\n` +
                            `Category: ${next.category} (${next.difficulty})\n\n` +
                            `*${next.question}*\n\n${optionsText}\n\n` +
                            `You have ${game.settings.timeLimit} seconds to answer with \`.trivia answer <letter>\``
                        );
                        // Set timeout for question
                        if (game.timeout) clearTimeout(game.timeout);
                        game.timeout = setTimeout(async () => {
                            // Time's up – force next round
                            if (game.state === 'playing' && !game.allAnswered()) {
                                // Mark unanswered players as wrong
                                for (let [pid, player] of game.players) {
                                    if (!game.answers.has(pid)) {
                                        game.submitAnswer(pid, ''); // empty answer = wrong
                                    }
                                }
                                // Trigger next round
                                // We'll just call the same logic as above, but to avoid recursion we'll use a message.
                                // Actually, we can just call the same code again.
                                // But better to emit a fake event? For simplicity, we'll just handle it similarly.
                                // We'll reuse the "all answered" logic by re-evaluating.
                                if (game.allAnswered()) {
                                    // Show results and next round
                                    // This is a bit messy; we'll just post a timeout message and then proceed.
                                    await reply(`⏰ Time's up! Moving to next round.`);
                                    const results = game.getRoundResults();
                                    let roundMsg = `📊 *Round ${game.currentRound} Results*\n\n`;
                                    results.forEach(r => {
                                        roundMsg += `${r.name}: ${r.isCorrect ? '✅' : '❌'} +${r.points}pts\n`;
                                    });
                                    await reply(roundMsg, Array.from(game.players.keys()));
                                    const next = await game.nextQuestion();
                                    if (next.type === 'end') {
                                        const leaderboard = game.getLeaderboard();
                                        let finalMsg = `🏆 *Game Over!*\n\nFinal Scores:\n`;
                                        leaderboard.forEach((p, i) => {
                                            finalMsg += `${i+1}. ${p.name}: ${p.score} points\n`;
                                        });
                                        await reply(finalMsg, Array.from(game.players.keys()));
                                        games.delete(chatId);
                                    } else {
                                        const optionsText = next.options.map((opt, i) => `${String.fromCharCode(65+i)}. ${opt}`).join('\n');
                                        await reply(
                                            `🎯 *Round ${next.round}/${next.total}*\n` +
                                            `Category: ${next.category} (${next.difficulty})\n\n` +
                                            `*${next.question}*\n\n${optionsText}\n\n` +
                                            `You have ${game.settings.timeLimit} seconds to answer with \`.trivia answer <letter>\``
                                        );
                                    }
                                }
                            }
                        }, game.settings.timeLimit * 1000);
                    }
                } catch (e) {
                    await reply(`❌ Error: ${e.message}`);
                    games.delete(chatId);
                }
            }
            return;
        }

        // ----- HOST START (trigger start) -----
        // If host wants to start the game before everyone joins
        if (subCmd === 'startgame' && isHost) {
            if (game.state !== 'waiting') {
                return await reply('❌ Game already started.');
            }
            try {
                const next = await game.start(); // start sets state to playing and fetches first question
                const optionsText = next.options.map((opt, i) => `${String.fromCharCode(65+i)}. ${opt}`).join('\n');
                await reply(
                    `🎯 *Game Started!*\n\n` +
                    `*Round ${next.round}/${next.total}*\n` +
                    `Category: ${next.category} (${next.difficulty})\n\n` +
                    `*${next.question}*\n\n${optionsText}\n\n` +
                    `You have ${game.settings.timeLimit} seconds to answer with \`.trivia answer <letter>\``
                );
                // Set timeout
                game.timeout = setTimeout(async () => {
                    // Time's up logic (same as above)
                    // We'll copy the timeout logic from answer section; for brevity, we'll just send a message.
                    // In practice, you'd refactor this into a method.
                    if (game.state === 'playing' && !game.allAnswered()) {
                        for (let [pid, player] of game.players) {
                            if (!game.answers.has(pid)) {
                                game.submitAnswer(pid, '');
                            }
                        }
                        await reply(`⏰ Time's up!`);
                        // ... etc.
                    }
                }, game.settings.timeLimit * 1000);
            } catch (e) {
                await reply(`❌ ${e.message}`);
            }
            return;
        }

        // If none matched
        await reply('❌ Unknown subcommand. Use `.trivia guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading trivia.js:', e.message); }

/* ===== tictactoe.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
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

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading tictactoe.js:', e.message); }

/* ===== sudoku.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class Sudoku {
    constructor() {
        // Predefined 4x4 puzzle (0 = empty)
        this.puzzle = [
            [1, 0, 0, 4],
            [0, 3, 2, 0],
            [0, 1, 4, 0],
            [2, 0, 0, 3]
        ];
        this.solution = [
            [1, 2, 3, 4],
            [4, 3, 2, 1],
            [3, 1, 4, 2],
            [2, 4, 1, 3]
        ];
        this.board = JSON.parse(JSON.stringify(this.puzzle)); // copy
        this.completed = false;
    }

    place(row, col, num) {
        const r = row - 1, c = col - 1;
        if (this.completed) return { error: 'Game already completed' };
        if (r < 0 || r >= 4 || c < 0 || c >= 4) return { error: 'Invalid row/col (use 1-4)' };
        if (this.puzzle[r][c] !== 0) return { error: 'That cell is fixed (cannot change)' };
        if (num < 1 || num > 4) return { error: 'Number must be 1-4' };

        this.board[r][c] = num;

        // Check win
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] !== this.solution[i][j]) return { success: true };
            }
        }
        this.completed = true;
        return { success: true, win: true };
    }

    getDisplayBoard() {
        const emoji = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣'];
        let str = '```\n   ';
        for (let c = 0; c < 4; c++) str += ` ${c+1} `;
        str += '\n';
        for (let r = 0; r < 4; r++) {
            str += ` ${r+1} `;
            for (let c = 0; c < 4; c++) {
                const val = this.board[r][c];
                if (val === 0) str += '⬜';
                else str += emoji[val];
                str += ' ';
            }
            str += '\n';
        }
        str += '```';
        return str;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `sudoku-${chatId}:${player}`

module.exports = {
    command: 'sudoku',
    aliases: ['sd'],
    category: 'games',
    description: 'Solve a 4x4 Sudoku puzzle.',
    usage: 
        '.sd start                  – Start a new puzzle\n' +
        '.sd place <row> <col> <num> – Place a number (1-4)\n' +
        '.sd guide                   – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🧩 *Sudoku Commands*\n\n` +
                `• \`.sd start\` – New puzzle\n` +
                `• \`.sd place <row> <col> <num>\` – Place a number\n` +
                `• \`.sd guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Sudoku Guide*\n\n` +
                `1. Start a game: \`.sd start\`\n` +
                `2. Fill empty cells (⬜) with numbers 1-4\n` +
                `3. Each row, column, and 2x2 box must contain 1-4 exactly once\n` +
                `4. Fixed cells cannot be changed\n` +
                `5. Use \`.sd place <row> <col> <num>\` (e.g., \`.sd place 2 3 1\`)\n` +
                `6. When the board matches the solution, you win!`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`sudoku-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new Sudoku();
            const newKey = `sudoku-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🧩 *Sudoku Started!*\n\n${newGame.getDisplayBoard()}\n\nPlace numbers with \`.sd place <row> <col> <num>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.sd start`');

        if (subCmd === 'place') {
            if (args.length < 4) return await reply('❌ Usage: `.sd place <row> <col> <num>`');
            const row = parseInt(args[1]);
            const col = parseInt(args[2]);
            const num = parseInt(args[3]);
            if (isNaN(row) || isNaN(col) || isNaN(num)) return await reply('❌ Invalid numbers');
            const result = game.place(row, col, num);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.win) {
                games.delete(gameKey);
                return await reply(`🎉 *You Win!*\n\n${game.getDisplayBoard()}`);
            }

            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.sd guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading sudoku.js:', e.message); }

/* ===== blackjack.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

class Blackjack {
    constructor(playerId, bet = 10) {
        this.playerId = playerId;
        this.bet = bet;
        this.deck = this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.gameOver = false;
        this.result = null;
        this.balance = 100; // starting balance
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        const deck = [];
        for (let s of suits) {
            for (let v of values) {
                deck.push({ value: v, suit: s });
            }
        }
        return this.shuffle(deck);
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    deal() {
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        this.calculateScores();
    }

    calculateScores() {
        this.playerScore = this.handValue(this.playerHand);
        this.dealerScore = this.handValue(this.dealerHand);
    }

    handValue(hand) {
        let value = 0;
        let aces = 0;
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else if (['K','Q','J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        return value;
    }

    hit() {
        if (this.gameOver) return false;
        this.playerHand.push(this.deck.pop());
        this.playerScore = this.handValue(this.playerHand);
        if (this.playerScore > 21) {
            this.gameOver = true;
            this.result = 'bust';
            this.balance -= this.bet;
        }
        return true;
    }

    stand() {
        if (this.gameOver) return false;
        while (this.dealerScore < 17) {
            this.dealerHand.push(this.deck.pop());
            this.dealerScore = this.handValue(this.dealerHand);
        }
        this.gameOver = true;
        if (this.dealerScore > 21 || this.playerScore > this.dealerScore) {
            this.result = 'win';
            this.balance += this.bet;
        } else if (this.playerScore === this.dealerScore) {
            this.result = 'push';
        } else {
            this.result = 'lose';
            this.balance -= this.bet;
        }
    }

    getDisplayBoard(hideDealer = true) {
        const cardToEmoji = (card) => {
            const suitEmoji = { '♠':'♠️', '♥':'♥️', '♦':'♦️', '♣':'♣️' };
            return `${card.value}${suitEmoji[card.suit]}`;
        };

        let playerCards = this.playerHand.map(cardToEmoji).join(' ');
        let dealerCards = hideDealer && !this.gameOver
            ? `${cardToEmoji(this.dealerHand[0])} 🂠`
            : this.dealerHand.map(cardToEmoji).join(' ');

        let status = '';
        if (this.gameOver) {
            if (this.result === 'win') status = '🎉 *You Win!*';
            else if (this.result === 'lose') status = '💔 *You Lose!*';
            else if (this.result === 'push') status = '🤝 *Push*';
            else if (this.result === 'bust') status = '💥 *Bust!*';
        } else {
            status = 'Hit or Stand?';
        }

        return `🃏 *BLACKJACK* 🃏\n\n` +
               `Dealer: ${dealerCards} (${hideDealer && !this.gameOver ? '?' : this.dealerScore})\n` +
               `Player: ${playerCards} (${this.playerScore})\n\n` +
               `Balance: 💰 ${this.balance}  |  Bet: ${this.bet}\n\n` +
               status;
    }
}

const games = new Map(); // key = chatId:playerId

module.exports = {
    command: 'blackjack',
    aliases: ['bj'],
    category: 'games',
    description: 'Play Blackjack against the dealer.',
    usage: 
        '.bj start <bet>             – Start a new game with bet\n' +
        '.bj hit                       – Take another card\n' +
        '.bj stand                     – Stop and let dealer play\n' +
        '.bj guide                      – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🃏 *Blackjack Commands*\n\n` +
                `• \`.bj start <bet>\` – New game (bet 10-100)\n` +
                `• \`.bj hit\` – Draw card\n` +
                `• \`.bj stand\` – Stop\n` +
                `• \`.bj guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();
        const gameKey = `${chatId}:${senderId}`;
        let game = games.get(gameKey);

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Blackjack Guide*\n\n` +
                `1. Start a game with a bet: \`.bj start 20\`\n` +
                `2. You get two cards, dealer shows one\n` +
                `3. Aim to get as close to 21 without going over\n` +
                `4. Hit to take another card\n` +
                `5. Stand to let dealer play\n` +
                `6. Dealer must hit on 16 and stand on 17\n` +
                `7. Win if you beat dealer, lose if bust\n` +
                `8. Blackjack (21 with two cards) pays 2x`
            );
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const bet = args.length > 1 ? parseInt(args[1]) : 10;
            if (isNaN(bet) || bet < 10 || bet > 100) return await reply('❌ Bet must be 10-100.');
            game = new Blackjack(senderId, bet);
            game.deal();
            games.set(gameKey, game);
            return await reply(game.getDisplayBoard());
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.bj start <bet>`');

        if (subCmd === 'hit') {
            game.hit();
            if (game.gameOver) {
                await reply(game.getDisplayBoard(false));
                games.delete(gameKey);
            } else {
                await reply(game.getDisplayBoard());
            }
            return;
        }

        if (subCmd === 'stand') {
            game.stand();
            await reply(game.getDisplayBoard(false));
            games.delete(gameKey);
            return;
        }

        await reply('❌ Unknown subcommand. Use `.bj guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading blackjack.js:', e.message); }

/* ===== rps.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/rps.js
module.exports = {
  command: 'rps',
  aliases: ['rockpaperscissors'],
  category: 'game',
  description: 'Play Rock, Paper, Scissors',
  usage: '.rps <rock|paper|scissors>',
  
  async handler(sock, message, args, context) {
    const { chatId, senderId } = context;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '❌ Choose: rock, paper, or scissors'
      }, { quoted: message });
    }

    const userChoice = args[0].toLowerCase();
    const choices = ['rock', 'paper', 'scissors'];
    if (!choices.includes(userChoice)) {
      return await sock.sendMessage(chatId, {
        text: '❌ Invalid choice. Use rock, paper, or scissors.'
      }, { quoted: message });
    }

    const botChoice = choices[Math.floor(Math.random() * 3)];
    let result;
    if (userChoice === botChoice) result = "It's a tie!";
    else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) result = 'You win! 🎉';
    else result = 'Bot wins! 🤖';

    await sock.sendMessage(chatId, {
      text: `You chose **${userChoice}**\nBot chose **${botChoice}**\n\n${result}`
    }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading rps.js:', e.message); }

/* ===== guess.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class GuessNumber {
    constructor() {
        this.number = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
        this.gameOver = false;
        this.won = false;
    }

    guess(num) {
        if (this.gameOver || this.won) return { error: 'Game already ended' };
        if (num < 1 || num > 100) return { error: 'Number must be between 1 and 100' };

        this.attempts++;
        if (num === this.number) {
            this.won = true;
            return { success: true, result: 'correct' };
        } else if (num < this.number) {
            return { success: true, result: 'too low' };
        } else {
            return { success: true, result: 'too high' };
        }
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `guess-${chatId}:${player}`

module.exports = {
    command: 'guess',
    aliases: ['guessnumber'],
    category: 'games',
    description: 'Guess the number between 1 and 100.',
    usage: 
        '.guess start                – Start a new game\n' +
        '.guess <number>             – Make a guess\n' +
        '.guess guide                 – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🔢 *Guess the Number Commands*\n\n` +
                `• \`.guess start\` – New game\n` +
                `• \`.guess <number>\` – Make a guess (1-100)\n` +
                `• \`.guess guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Guess the Number Guide*\n\n` +
                `1. Start a game: \`.guess start\`\n` +
                `2. The bot picks a random number between 1 and 100\n` +
                `3. Make guesses: \`.guess 42\`\n` +
                `4. You'll get hints: "too low" or "too high"\n` +
                `5. Keep guessing until you find the number!\n` +
                `6. The number of attempts is shown when you win.`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`guess-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new GuessNumber();
            const newKey = `guess-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(`🔢 *Guess the Number Started!*\n\nI'm thinking of a number between 1 and 100. Start guessing with \`.guess <number>\``);
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.guess start`');

        // If the first argument is a number, treat as guess
        const guessNum = parseInt(subCmd);
        if (!isNaN(guessNum)) {
            const result = game.guess(guessNum);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.result === 'correct') {
                games.delete(gameKey);
                return await reply(`🎉 *Correct!* You guessed the number in ${game.attempts} attempts.`);
            } else {
                return await reply(`Your guess is ${result.result}.`);
            }
        }

        await reply('❌ Unknown subcommand. Use `.guess guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading guess.js:', e.message); }

/* ===== wordle.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

// plugins/wordle.js
const games = new Map();
const words = [
    'APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRACE', 'HEART',
    'IMAGE', 'JOKER', 'KNIFE', 'LEMON', 'MONEY', 'NIGHT', 'OCEAN', 'PIANO',
    'QUEEN', 'RADIO', 'SNAKE', 'TABLE', 'UMBRE', 'VOICE', 'WATER', 'XENON',
    'YACHT', 'ZEBRA'
];

module.exports = {
    command: 'wordle',
    aliases: ['wd'],
    category: 'games',
    description: 'Play Wordle. Guess a 5-letter word in 6 attempts.',
    usage: '.wordle start\n.wordle guess <word>\n.wordle surrender',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const sub = args[0]?.toLowerCase();

        let userGame = null;
        let gameId = null;
        for (let [id, g] of games.entries()) {
            if (g.player === senderId && g.state === 'playing') {
                userGame = g;
                gameId = id;
                break;
            }
        }

        if (sub === 'start') {
            if (userGame) {
                return await sock.sendMessage(chatId, {
                    text: '❌ You already have an ongoing game. Use .wordle surrender to quit.'
                }, { quoted: message });
            }
            const word = words[Math.floor(Math.random() * words.length)];
            const game = {
                word,
                guesses: [],
                attempts: 0,
                maxAttempts: 6,
                player: senderId,
                state: 'playing',
                chatId
            };
            const newId = `wordle-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
            games.set(newId, game);

            await sock.sendMessage(chatId, {
                text: `🎮 *Wordle Started!*\n\nGuess a 5-letter word. You have 6 attempts.\n\nUse .wordle guess <word> to play.`
            }, { quoted: message });
            return;
        }

        if (sub === 'surrender') {
            if (!userGame) {
                return await sock.sendMessage(chatId, {
                    text: '❌ You have no ongoing game.'
                }, { quoted: message });
            }
            games.delete(gameId);
            await sock.sendMessage(chatId, {
                text: `🏳️ Game surrendered. The word was: *${userGame.word}*`
            }, { quoted: message });
            return;
        }

        if (sub === 'guess') {
            const guess = args[1]?.toUpperCase();
            if (!guess || guess.length !== 5 || !/^[A-Z]{5}$/.test(guess)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Please guess a 5-letter word (A-Z).'
                }, { quoted: message });
            }

            if (!userGame) {
                return await sock.sendMessage(chatId, {
                    text: '❌ No game in progress. Start one with .wordle start'
                }, { quoted: message });
            }

            userGame.guesses.push(guess);
            userGame.attempts++;

            const target = userGame.word;
            let feedback = '';
            for (let i = 0; i < 5; i++) {
                if (guess[i] === target[i]) {
                    feedback += '🟩'; // correct position
                } else if (target.includes(guess[i])) {
                    feedback += '🟨'; // wrong position
                } else {
                    feedback += '⬛'; // not in word
                }
            }

            let display = '';
            for (let g of userGame.guesses) {
                let line = '';
                for (let i = 0; i < 5; i++) {
                    if (g[i] === target[i]) {
                        line += '🟩';
                    } else if (target.includes(g[i])) {
                        line += '🟨';
                    } else {
                        line += '⬛';
                    }
                }
                display += `${g} : ${line}\n`;
            }

            if (guess === target) {
                games.delete(gameId);
                await sock.sendMessage(chatId, {
                    text: `🎉 *You Win!*\n\n${display}\n\nWord: ${target}\nAttempts: ${userGame.attempts}`
                }, { quoted: message });
                return;
            }

            if (userGame.attempts >= userGame.maxAttempts) {
                games.delete(gameId);
                await sock.sendMessage(chatId, {
                    text: `💀 *Game Over!*\n\n${display}\n\nThe word was: ${target}\n\nBetter luck next time!`
                }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, {
                text: `*Wordle*\n\n${display}\n\nAttempts left: ${userGame.maxAttempts - userGame.attempts}`
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `📖 *Wordle*\n\nCommands:\n.wordle start - Start a new game\n.wordle guess <word> - Guess a 5-letter word\n.wordle surrender - Give up`
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading wordle.js:', e.message); }

/* ===== connect4.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
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

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading connect4.js:', e.message); }

/* ===== minesweeper.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class Minesweeper {
    constructor(size = 5, mineCount = 5) {
        this.size = size;
        this.mineCount = mineCount;
        this.board = this.createBoard();
        this.revealed = Array(size).fill().map(() => Array(size).fill(false));
        this.flagged = Array(size).fill().map(() => Array(size).fill(false));
        this.gameOver = false;
        this.won = false;
    }

    createBoard() {
        const board = Array(this.size).fill().map(() => Array(this.size).fill(' '));
        let placed = 0;
        while (placed < this.mineCount) {
            const r = Math.floor(Math.random() * this.size);
            const c = Math.floor(Math.random() * this.size);
            if (board[r][c] !== '💣') {
                board[r][c] = '💣';
                placed++;
            }
        }
        return board;
    }

    countAdjacentMines(r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === '💣') count++;
            }
        }
        return count;
    }

    reveal(r, c) {
        if (this.gameOver || this.won) return { error: 'Game already ended' };
        if (this.revealed[r][c]) return { error: 'Cell already revealed' };
        if (this.flagged[r][c]) return { error: 'Cell is flagged. Unflag first.' };

        if (this.board[r][c] === '💣') {
            this.gameOver = true;
            return { mine: true };
        }

        const adjacent = this.countAdjacentMines(r, c);
        this.board[r][c] = adjacent === 0 ? ' ' : adjacent.toString();
        this.revealed[r][c] = true;

        if (adjacent === 0) {
            // flood fill
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && !this.revealed[nr][nc] && this.board[nr][nc] !== '💣') {
                        this.reveal(nr, nc);
                    }
                }
            }
        }

        // Check win: all non-mine cells revealed
        let allRevealed = true;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] !== '💣' && !this.revealed[r][c]) {
                    allRevealed = false;
                    break;
                }
            }
        }
        if (allRevealed) {
            this.won = true;
        }

        return { success: true };
    }

    flag(r, c) {
        if (this.gameOver || this.won) return { error: 'Game already ended' };
        if (this.revealed[r][c]) return { error: 'Cannot flag revealed cell' };
        this.flagged[r][c] = !this.flagged[r][c];
        return { success: true };
    }

    // Display board during gameplay (hides mines)
    getDisplayBoard() {
        let str = '```\n   ';
        for (let c = 0; c < this.size; c++) {
            str += ` ${c+1} `;
        }
        str += '\n';
        for (let r = 0; r < this.size; r++) {
            str += ` ${r+1} `;
            for (let c = 0; c < this.size; c++) {
                if (this.flagged[r][c]) {
                    str += '🚩';
                } else if (this.revealed[r][c]) {
                    const cell = this.board[r][c];
                    if (cell === ' ') {
                        str += '⬜'; // empty revealed
                    } else if (cell === '💣') {
                        str += '💣'; // should never happen during gameplay
                    } else {
                        const numEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
                        str += numEmoji[parseInt(cell)-1];
                    }
                } else {
                    str += '⬛'; // unrevealed
                }
                str += ' ';
            }
            str += '\n';
        }
        str += '```';
        return str;
    }

    // Final board when game ends (reveals everything)
    getFinalBoard() {
        let str = '```\n   ';
        for (let c = 0; c < this.size; c++) {
            str += ` ${c+1} `;
        }
        str += '\n';
        for (let r = 0; r < this.size; r++) {
            str += ` ${r+1} `;
            for (let c = 0; c < this.size; c++) {
                const cell = this.board[r][c];
                if (cell === '💣') {
                    str += '💣';
                } else if (this.revealed[r][c]) {
                    if (cell === ' ') {
                        str += '⬜';
                    } else {
                        const numEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
                        str += numEmoji[parseInt(cell)-1];
                    }
                } else {
                    str += '⬛'; // shouldn't happen if we reveal all, but just in case
                }
                str += ' ';
            }
            str += '\n';
        }
        str += '```';
        return str;
    }

    getRemainingMines() {
        let flagged = 0;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.flagged[r][c]) flagged++;
            }
        }
        return this.mineCount - flagged;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `ms-${chatId}:${player}` (only one game per player at a time)

module.exports = {
    command: 'minesweeper',
    aliases: ['ms'],
    category: 'games',
    description: 'Play Minesweeper (5x5 with 5 mines).',
    usage: 
        '.ms start                  – Start a new game\n' +
        '.ms open <row> <col>       – Reveal a cell (1-5)\n' +
        '.ms flag <row> <col>       – Place/remove a flag\n' +
        '.ms guide                   – Show game guide',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `💣 *Minesweeper Commands*\n\n` +
                `• \`.ms start\` – Start a new game\n` +
                `• \`.ms open <row> <col>\` – Reveal a cell (1-5)\n` +
                `• \`.ms flag <row> <col>\` – Place/remove a flag\n` +
                `• \`.ms guide\` – Show game guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Minesweeper Guide*\n\n` +
                `1. Start a game: \`.ms start\`\n` +
                `2. Reveal cells with \`.ms open <row> <col>\` (rows/cols 1-5)\n` +
                `3. Flag potential mines with \`.ms flag <row> <col>\`\n` +
                `4. Numbers show adjacent mines\n` +
                `5. Reveal all safe cells to win\n` +
                `6. Hit a mine and you lose!\n` +
                `7. Remaining mines are shown at the bottom.`
            );
        }

        // Find existing game for this player
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`ms-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) {
                games.delete(gameKey);
            }
            const newGame = new Minesweeper();
            const newKey = `ms-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);

            await reply(
                `💣 *Minesweeper Started!*\n\n` +
                `${newGame.getDisplayBoard()}\n\n` +
                `Mines left: ${newGame.getRemainingMines()}\n\n` +
                `Commands:\n` +
                `• \`.ms open <row> <col>\` – reveal\n` +
                `• \`.ms flag <row> <col>\` – flag/unflag`
            );
            return;
        }

        if (!game) {
            return await reply('❌ No game in progress. Start one with `.ms start`');
        }

        if (subCmd === 'open') {
            if (args.length < 3) return await reply('❌ Usage: `.ms open <row> <col>`');
            const row = parseInt(args[1]) - 1;
            const col = parseInt(args[2]) - 1;
            if (isNaN(row) || isNaN(col) || row < 0 || row >= 5 || col < 0 || col >= 5) {
                return await reply('❌ Coordinates must be numbers between 1 and 5.');
            }

            const result = game.reveal(row, col);
            if (result.error) {
                return await reply(`❌ ${result.error}`);
            }

            if (result.mine) {
                games.delete(gameKey);
                return await reply(
                    `💥 *Boom!* You hit a mine!\n\n` +
                    `${game.getFinalBoard()}\n\nGame over.`
                );
            }

            if (game.won) {
                games.delete(gameKey);
                return await reply(
                    `🎉 *You Win!*\n\n${game.getFinalBoard()}\n\nCongratulations!`
                );
            }

            await reply(
                `${game.getDisplayBoard()}\n\n` +
                `Mines left: ${game.getRemainingMines()}\n\n` +
                `Revealed (${args[1]},${args[2]}) – ${game.countAdjacentMines(row, col)} adjacent mines.`
            );
            return;
        }

        if (subCmd === 'flag') {
            if (args.length < 3) return await reply('❌ Usage: `.ms flag <row> <col>`');
            const row = parseInt(args[1]) - 1;
            const col = parseInt(args[2]) - 1;
            if (isNaN(row) || isNaN(col) || row < 0 || row >= 5 || col < 0 || col >= 5) {
                return await reply('❌ Coordinates must be numbers between 1 and 5.');
            }

            const result = game.flag(row, col);
            if (result.error) {
                return await reply(`❌ ${result.error}`);
            }

            await reply(
                `${game.getDisplayBoard()}\n\n` +
                `Mines left: ${game.getRemainingMines()}\n\n` +
                `Flag toggled at (${args[1]},${args[2]}).`
            );
            return;
        }

        await reply('❌ Unknown subcommand. Use `.ms guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading minesweeper.js:', e.message); }

/* ===== twenty48.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class Twenty48 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.addRandomTile();
        this.addRandomTile();
        this.gameOver = false;
        this.won = false;
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) empty.push([r, c]);
            }
        }
        if (empty.length === 0) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        if (this.gameOver || this.won) return { error: 'Game already ended' };

        // Helper to rotate board
        const rotate = (board) => {
            const newBoard = Array(4).fill().map(() => Array(4).fill(0));
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    newBoard[c][3 - r] = board[r][c];
                }
            }
            return newBoard;
        };

        const moveLeft = (board) => {
            let changed = false;
            for (let r = 0; r < 4; r++) {
                let row = board[r].filter(v => v !== 0);
                for (let i = 0; i < row.length - 1; i++) {
                    if (row[i] === row[i + 1]) {
                        row[i] *= 2;
                        row.splice(i + 1, 1);
                        changed = true;
                    }
                }
                while (row.length < 4) row.push(0);
                if (board[r].join(',') !== row.join(',')) changed = true;
                board[r] = row;
            }
            return changed;
        };

        let changed = false;
        let newBoard = this.board.map(row => [...row]);

        if (direction === 'left') {
            changed = moveLeft(newBoard);
        } else if (direction === 'right') {
            newBoard = newBoard.map(row => row.reverse());
            changed = moveLeft(newBoard);
            newBoard = newBoard.map(row => row.reverse());
        } else if (direction === 'up') {
            newBoard = rotate(rotate(rotate(newBoard))); // rotate to left orientation
            changed = moveLeft(newBoard);
            newBoard = rotate(newBoard); // rotate back
        } else if (direction === 'down') {
            newBoard = rotate(newBoard);
            changed = moveLeft(newBoard);
            newBoard = rotate(rotate(rotate(newBoard)));
        }

        if (!changed) return { success: true, noMove: true };

        this.board = newBoard;
        this.addRandomTile();

        // Check win (2048 tile present)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 2048) {
                    this.won = true;
                    return { success: true, win: true };
                }
            }
        }

        // Check game over (no empty cells and no adjacent equal)
        let hasEmpty = false;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) hasEmpty = true;
            }
        }
        if (!hasEmpty) {
            // Check for possible merges
            let possible = false;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 3; c++) {
                    if (this.board[r][c] === this.board[r][c+1]) possible = true;
                }
            }
            for (let c = 0; c < 4; c++) {
                for (let r = 0; r < 3; r++) {
                    if (this.board[r][c] === this.board[r+1][c]) possible = true;
                }
            }
            if (!possible) this.gameOver = true;
        }

        return { success: true };
    }

    getDisplayBoard() {
        const numEmoji = ['0️⃣','2️⃣','4️⃣','8️⃣','🔟','💯','🎲']; // simplified
        const getEmoji = (val) => {
            if (val === 0) return '⬛';
            const map = { 2:'2️⃣',4:'4️⃣',8:'8️⃣',16:'🔟',32:'💯',64:'🎲',128:'1️⃣2️⃣8️⃣',256:'2️⃣5️⃣6️⃣',512:'5️⃣1️⃣2️⃣',1024:'1️⃣0️⃣2️⃣4️⃣',2048:'🏆' };
            return map[val] || val.toString();
        };
        let str = '```\n';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                str += getEmoji(this.board[r][c]) + ' ';
            }
            str += '\n';
        }
        str += '```';
        return str;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `2048-${chatId}:${player}`

module.exports = {
    command: '2048',
    aliases: ['twenty48'],
    category: 'games',
    description: 'Slide tiles to combine and reach 2048.',
    usage: 
        '.2048 start                  – Start a new game\n' +
        '.2048 <left|right|up|down>   – Move tiles\n' +
        '.2048 guide                   – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🎲 *2048 Commands*\n\n` +
                `• \`.2048 start\` – New game\n` +
                `• \`.2048 left\`, \`.2048 right\`, \`.2048 up\`, \`.2048 down\` – Move\n` +
                `• \`.2048 guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *2048 Guide*\n\n` +
                `1. Start a game: \`.2048 start\`\n` +
                `2. Use arrow commands to slide all tiles:\n` +
                `   \`.2048 left\`, \`.2048 right\`, \`.2048 up\`, \`.2048 down\`\n` +
                `3. Tiles with the same number merge when they collide\n` +
                `4. After each move, a new 2 or 4 appears\n` +
                `5. Aim to create a tile with 2048!\n` +
                `6. Game ends when no moves are possible.`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`2048-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new Twenty48();
            const newKey = `2048-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🎲 *2048 Started!*\n\n${newGame.getDisplayBoard()}\n\nMove with \`.2048 left/right/up/down\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.2048 start`');

        const directions = ['left', 'right', 'up', 'down'];
        if (directions.includes(subCmd)) {
            const result = game.move(subCmd);
            if (result.error) return await reply(`❌ ${result.error}`);
            if (result.noMove) return await reply('No tiles moved.');

            if (result.win) {
                games.delete(gameKey);
                return await reply(`🎉 *You Win!* You reached 2048!\n\n${game.getDisplayBoard()}`);
            }
            if (game.gameOver) {
                games.delete(gameKey);
                return await reply(`💀 *Game Over!* No moves left.\n\n${game.getDisplayBoard()}`);
            }

            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.2048 guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading twenty48.js:', e.message); }

/* ===== battleship.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

class Battleship {
    constructor(player1, player2) {
        this.players = [player1, player2];
        this.boards = [
            this.createEmptyBoard(),
            this.createEmptyBoard()
        ];
        this.ships = [
            this.placeShips(),
            this.placeShips()
        ];
        this.turn = 0; // index of current player
        this.gameOver = false;
        this.winner = null;
    }

    createEmptyBoard() {
        return Array(8).fill().map(() => Array(8).fill('🌊'));
    }

    placeShips() {
        const ships = [];
        const sizes = [5,4,3,3,2]; // ship sizes
        for (let size of sizes) {
            let placed = false;
            for (let attempt = 0; attempt < 100; attempt++) {
                const horizontal = Math.random() < 0.5;
                const r = Math.floor(Math.random() * 8);
                const c = Math.floor(Math.random() * 8);
                if (horizontal && c + size > 8) continue;
                if (!horizontal && r + size > 8) continue;
                
                // Check if cells are free
                let conflict = false;
                for (let i = 0; i < size; i++) {
                    const nr = horizontal ? r : r + i;
                    const nc = horizontal ? c + i : c;
                    if (ships.some(s => s.r === nr && s.c === nc)) {
                        conflict = true;
                        break;
                    }
                }
                if (conflict) continue;
                
                // Place ship
                for (let i = 0; i < size; i++) {
                    const nr = horizontal ? r : r + i;
                    const nc = horizontal ? c + i : c;
                    ships.push({ r: nr, c: nc });
                }
                placed = true;
                break;
            }
            if (!placed) {
                // fallback - just place somewhere
                for (let i = 0; i < size; i++) {
                    ships.push({ r: i, c: i });
                }
            }
        }
        return ships;
    }

    attack(playerIndex, r, c) {
        if (this.gameOver) return { error: 'Game already ended' };
        if (playerIndex !== this.turn) return { error: 'Not your turn' };
        
        const opponent = 1 - playerIndex;
        const board = this.boards[opponent];
        const ships = this.ships[opponent];
        
        if (board[r][c] !== '🌊') return { error: 'Already targeted' };
        
        const hit = ships.some(s => s.r === r && s.c === c);
        board[r][c] = hit ? '💥' : '⬜';
        
        // Check if all ships sunk
        const allSunk = ships.every(s => board[s.r][s.c] === '💥');
        if (allSunk) {
            this.gameOver = true;
            this.winner = this.players[playerIndex];
        }
        
        this.turn = opponent;
        return { hit, gameOver: this.gameOver };
    }

    getDisplayBoard(playerIndex) {
        const board = this.boards[playerIndex];
        const opponentBoard = this.boards[1 - playerIndex];
        
        let yourBoard = '🚢 *YOUR BOARD*\n   ';
        for (let c = 0; c < 8; c++) yourBoard += (c+1) + ' ';
        yourBoard += '\n';
        for (let r = 0; r < 8; r++) {
            yourBoard += (r+1).toString().padStart(2) + ' ';
            for (let c = 0; c < 8; c++) {
                const isShip = this.ships[playerIndex].some(s => s.r === r && s.c === c);
                yourBoard += (isShip && board[r][c] === '🌊') ? '🚢' : board[r][c];
                yourBoard += ' ';
            }
            yourBoard += '\n';
        }
        
        let enemyBoard = '🎯 *ENEMY BOARD*\n   ';
        for (let c = 0; c < 8; c++) enemyBoard += (c+1) + ' ';
        enemyBoard += '\n';
        for (let r = 0; r < 8; r++) {
            enemyBoard += (r+1).toString().padStart(2) + ' ';
            for (let c = 0; c < 8; c++) {
                enemyBoard += opponentBoard[r][c] + ' ';
            }
            enemyBoard += '\n';
        }
        
        let status = `\nTurn: ${this.players[this.turn] === this.players[playerIndex] ? 'YOUR' : 'OPPONENT'}'s turn`;
        if (this.gameOver) status = `\n🏆 *${this.winner} wins!* 🏆`;
        
        return yourBoard + '\n' + enemyBoard + status;
    }
}

const games = new Map(); // key = chatId

module.exports = {
    command: 'battleship',
    aliases: ['bs'],
    category: 'games',
    description: 'Classic battleship game for two players.',
    usage: 
        '.bs start                   – Start a new game (you host)\n' +
        '.bs join                     – Join waiting game\n' +
        '.bs attack <row> <col>       – Attack coordinates (1-8)\n' +
        '.bs guide                      – Show game guide',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const senderName = message.pushName || senderId.split('@')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🚢 *Battleship Commands*\n\n` +
                `• \`.bs start\` – Host a game\n` +
                `• \`.bs join\` – Join waiting game\n` +
                `• \`.bs attack <row> <col>\` – Fire! (1-8)\n` +
                `• \`.bs guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Battleship Guide*\n\n` +
                `1. Host starts a game: \`.bs start\`\n` +
                `2. Opponent joins: \`.bs join\`\n` +
                `3. Take turns attacking with \`.bs attack <row> <col>\` (1-8)\n` +
                `4. 💥 = hit, ⬜ = miss, 🌊 = unknown\n` +
                `5. Sink all enemy ships to win!\n` +
                `6. Your own board shows 🚢 for your ships.`
            );
        }

        let game = games.get(chatId);

        if (subCmd === 'start') {
            if (game) games.delete(chatId);
            game = { players: [senderId], stage: 'waiting' };
            games.set(chatId, game);
            return await reply(
                `🚢 *Battleship Game Created!*\n\n` +
                `Host: @${senderName}\n` +
                `Waiting for opponent to join with \`.bs join\``,
                [senderId]
            );
        }

        if (subCmd === 'join') {
            if (!game || game.stage !== 'waiting') return await reply('❌ No game waiting to join.');
            if (game.players.includes(senderId)) return await reply('❌ You are already in the game.');
            game.players.push(senderId);
            game.stage = 'playing';
            game.bsGame = new Battleship(game.players[0], game.players[1]);
            await reply(
                `✅ Game started!\n\n` +
                game.bsGame.getDisplayBoard(0), // show player 0's view
                game.players
            );
            return;
        }

        if (!game || game.stage !== 'playing') return await reply('❌ No game in progress.');

        const playerIndex = game.players.indexOf(senderId);
        if (playerIndex === -1) return await reply('❌ You are not in this game.');

        if (subCmd === 'attack') {
            if (args.length < 3) return await reply('❌ Usage: `.bs attack <row> <col>`');
            const row = parseInt(args[1]) - 1;
            const col = parseInt(args[2]) - 1;
            if (isNaN(row) || isNaN(col) || row < 0 || row >= 8 || col < 0 || col >= 8) {
                return await reply('❌ Coordinates must be 1-8.');
            }

            const result = game.bsGame.attack(playerIndex, row, col);
            if (result.error) return await reply(`❌ ${result.error}`);

            // Show result to both players
            const boardPlayer0 = game.bsGame.getDisplayBoard(0);
            const boardPlayer1 = game.bsGame.getDisplayBoard(1);
            
            if (result.gameOver) {
                await sock.sendMessage(chatId, { text: boardPlayer0, ...channelInfo });
                await sock.sendMessage(chatId, { text: boardPlayer1, ...channelInfo });
                games.delete(chatId);
            } else {
                // Send appropriate board to each player (optional, but we can just send both)
                await sock.sendMessage(chatId, { text: boardPlayer0, ...channelInfo });
                await sock.sendMessage(chatId, { text: boardPlayer1, ...channelInfo });
            }
            return;
        }

        await reply('❌ Unknown subcommand. Use `.bs guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading battleship.js:', e.message); }

/* ===== memorypuzzle.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

class MemoryPuzzle {
    constructor(size = 4) {
        this.size = size;
        this.cards = this.createCards();
        this.revealed = Array(size).fill().map(() => Array(size).fill(false));
        this.matched = Array(size).fill().map(() => Array(size).fill(false));
        this.selected = null; // { r, c }
        this.moves = 0;
        this.startTime = Date.now();
        this.gameOver = false;
    }

    createCards() {
        const symbols = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐸','🐧','🐦','🐤','🐴','🦄','🐲'];
        const pairs = this.size * this.size / 2;
        const selected = symbols.slice(0, pairs);
        const deck = [...selected, ...selected];
        return this.shuffle(deck);
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // Convert to 2D
        const grid = [];
        for (let r = 0; r < this.size; r++) {
            grid.push(arr.slice(r * this.size, (r+1) * this.size));
        }
        return grid;
    }

    flip(r, c) {
        if (this.gameOver) return { error: 'Game already ended' };
        if (this.matched[r][c]) return { error: 'Already matched' };
        if (this.revealed[r][c]) return { error: 'Already flipped' };

        this.revealed[r][c] = true;
        this.moves++;

        if (this.selected) {
            // Second card
            const first = this.selected;
            const second = { r, c };
            const match = this.cards[first.r][first.c] === this.cards[second.r][second.c];

            if (match) {
                this.matched[first.r][first.c] = true;
                this.matched[second.r][second.c] = true;
                this.selected = null;

                // Check win
                let allMatched = true;
                for (let r = 0; r < this.size; r++) {
                    for (let c = 0; c < this.size; c++) {
                        if (!this.matched[r][c]) allMatched = false;
                    }
                }
                if (allMatched) {
                    this.gameOver = true;
                    return { match: true, win: true, moves: this.moves, time: (Date.now() - this.startTime)/1000 };
                }
                return { match: true };
            } else {
                // No match, will hide after delay
                return { match: false, first, second };
            }
        } else {
            // First card
            this.selected = { r, c };
            return { first: true };
        }
    }

    resetMismatch(first, second) {
        this.revealed[first.r][first.c] = false;
        this.revealed[second.r][second.c] = false;
        this.selected = null;
    }

    getDisplayBoard() {
        let board = '```\n   ';
        for (let c = 0; c < this.size; c++) board += (c+1) + ' ';
        board += '\n';
        for (let r = 0; r < this.size; r++) {
            board += (r+1).toString().padStart(2) + ' ';
            for (let c = 0; c < this.size; c++) {
                if (this.matched[r][c]) {
                    board += this.cards[r][c] + ' ';
                } else if (this.revealed[r][c]) {
                    board += this.cards[r][c] + ' ';
                } else {
                    board += '⬛ ';
                }
            }
            board += '\n';
        }
        board += '```';
        board += `\nMoves: ${this.moves}  Time: ${Math.floor((Date.now() - this.startTime)/1000)}s`;
        return board;
    }
}

const games = new Map(); // key = chatId:playerId

module.exports = {
    command: 'memory',
    aliases: ['mem'],
    category: 'games',
    description: 'Test your memory by matching pairs.',
    usage: 
        '.mem start [size]           – Start new game (size 4 or 6)\n' +
        '.mem flip <row> <col>        – Flip a card\n' +
        '.mem guide                     – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🧩 *Memory Puzzle Commands*\n\n` +
                `• \`.mem start [size]\` – New game (4 or 6)\n` +
                `• \`.mem flip <row> <col>\` – Flip card\n` +
                `• \`.mem guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();
        const gameKey = `${chatId}:${senderId}`;
        let game = games.get(gameKey);

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Memory Puzzle Guide*\n\n` +
                `1. Start a game: \`.mem start 4\` (4x4 or 6x6)\n` +
                `2. Flip two cards to find matching pairs\n` +
                `3. If they match, they stay revealed\n` +
                `4. If not, they flip back after a short delay\n` +
                `5. Match all pairs to win!\n` +
                `6. Try to do it in as few moves as possible.`
            );
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const size = args.length > 1 ? parseInt(args[1]) : 4;
            if (size !== 4 && size !== 6) return await reply('❌ Size must be 4 or 6.');
            game = new MemoryPuzzle(size);
            games.set(gameKey, game);
            return await reply(
                `🧩 *Memory Puzzle Started!*\n\n${game.getDisplayBoard()}\n\nFlip cards with \`.mem flip <row> <col>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.mem start`');

        if (subCmd === 'flip') {
            if (args.length < 3) return await reply('❌ Usage: `.mem flip <row> <col>`');
            const row = parseInt(args[1]) - 1;
            const col = parseInt(args[2]) - 1;
            if (isNaN(row) || isNaN(col) || row < 0 || row >= game.size || col < 0 || col >= game.size) {
                return await reply(`❌ Coordinates must be 1-${game.size}.`);
            }

            const result = game.flip(row, col);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.win) {
                await reply(
                    `🎉 *You Win!*\n\n${game.getDisplayBoard()}\n\n` +
                    `Moves: ${result.moves}  Time: ${result.time.toFixed(1)}s`
                );
                games.delete(gameKey);
                return;
            }

            if (result.match === false) {
                // Show mismatch, then flip back
                await reply(`No match!\n\n${game.getDisplayBoard()}`);
                setTimeout(() => {
                    game.resetMismatch(result.first, result.second);
                    sock.sendMessage(chatId, { text: game.getDisplayBoard(), ...channelInfo });
                }, 2000);
                return;
            }

            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.mem guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading memorypuzzle.js:', e.message); }

/* ===== rpg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class RPGAdventure {
    constructor(player) {
        this.player = player;
        this.level = 1;
        this.exp = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.gold = 50;
        this.inventory = {
            'potion': 3,
            'sword': 1,
            'shield': 1
        };
        this.currentEnemy = null;
        this.inCombat = false;
    }

    explore() {
        if (this.hp <= 0) return { error: 'You are defeated! Use .rpg heal to recover' };
        
        // Random encounter (60% monster, 40% treasure)
        const encounter = Math.random();
        
        if (encounter < 0.6) {
            // Monster encounter
            const monsters = [
                { name: 'Goblin 👺', hp: 30, attack: 8, gold: 15, exp: 20 },
                { name: 'Orc 👹', hp: 50, attack: 12, gold: 25, exp: 35 },
                { name: 'Troll 🧌', hp: 80, attack: 15, gold: 40, exp: 50 }
            ];
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            this.currentEnemy = { ...monster, currentHp: monster.hp };
            this.inCombat = true;
            return { type: 'monster', monster: this.currentEnemy };
        } else {
            // Treasure find
            const treasures = [
                { type: 'gold', amount: 20 + Math.floor(Math.random() * 30) },
                { type: 'potion', amount: 1 },
                { type: 'exp', amount: 15 + Math.floor(Math.random() * 20) }
            ];
            const treasure = treasures[Math.floor(Math.random() * treasures.length)];
            
            if (treasure.type === 'gold') {
                this.gold += treasure.amount;
            } else if (treasure.type === 'potion') {
                this.inventory.potion += treasure.amount;
            } else if (treasure.type === 'exp') {
                this.addExp(treasure.amount);
            }
            
            return { type: 'treasure', treasure };
        }
    }

    attack() {
        if (!this.inCombat || !this.currentEnemy) return { error: 'Not in combat' };
        
        // Player attack
        const playerDamage = 10 + Math.floor(Math.random() * 10);
        this.currentEnemy.currentHp -= playerDamage;
        
        if (this.currentEnemy.currentHp <= 0) {
            // Victory
            const goldEarned = this.currentEnemy.gold;
            const expEarned = this.currentEnemy.exp;
            this.gold += goldEarned;
            this.addExp(expEarned);
            
            const result = {
                victory: true,
                enemy: this.currentEnemy.name,
                gold: goldEarned,
                exp: expEarned
            };
            
            this.currentEnemy = null;
            this.inCombat = false;
            return result;
        }
        
        // Enemy counter-attack
        const enemyDamage = Math.floor(Math.random() * this.currentEnemy.attack);
        this.hp = Math.max(0, this.hp - enemyDamage);
        
        return {
            playerDamage,
            enemyDamage,
            enemyHp: this.currentEnemy.currentHp,
            playerHp: this.hp
        };
    }

    usePotion() {
        if (this.inventory.potion <= 0) return { error: 'No potions left' };
        if (this.hp >= this.maxHp) return { error: 'HP already full' };
        
        this.inventory.potion--;
        this.hp = Math.min(this.maxHp, this.hp + 50);
        return { success: true, hp: this.hp };
    }

    addExp(amount) {
        this.exp += amount;
        const expNeeded = this.level * 100;
        if (this.exp >= expNeeded) {
            this.level++;
            this.exp -= expNeeded;
            this.maxHp += 20;
            this.hp = this.maxHp;
            return true; // leveled up
        }
        return false;
    }

    getDisplayBoard() {
        const hpBar = '❤️'.repeat(Math.ceil(this.hp / 10)) + '🖤'.repeat(10 - Math.ceil(this.hp / 10));
        
        let status = '';
        if (this.inCombat && this.currentEnemy) {
            const enemyHpBar = '💔'.repeat(Math.ceil(this.currentEnemy.currentHp / 10)) + '🖤'.repeat(10 - Math.ceil(this.currentEnemy.currentHp / 10));
            status = `⚔️ *IN COMBAT* ⚔️\n\n` +
                    `Enemy: ${this.currentEnemy.name}\n` +
                    `Enemy HP: ${enemyHpBar}\n\n` +
                    `Commands: \`.rpg attack\` or \`.rpg potion\``;
        } else {
            status = `🗺️ *Explore the world* with \`.rpg explore\``;
        }

        return `⚔️ *RPG ADVENTURE* ⚔️\n\n` +
               `Level ${this.level} | EXP: ${this.exp}/${this.level*100}\n` +
               `HP: ${hpBar} (${this.hp}/${this.maxHp})\n` +
               `💰 Gold: ${this.gold}  |  🧪 Potions: ${this.inventory.potion}\n\n` +
               status;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `rpg-${chatId}:${player}`

module.exports = {
    command: 'rpg',
    aliases: ['adventure'],
    category: 'games',
    description: 'Embark on a text-based RPG adventure.',
    usage: 
        '.rpg start                  – Start a new game\n' +
        '.rpg explore                 – Explore the world\n' +
        '.rpg attack                   – Attack current enemy\n' +
        '.rpg potion                    – Use a healing potion\n' +
        '.rpg stats                     – View your stats\n' +
        '.rpg guide                      – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `⚔️ *RPG Adventure Commands*\n\n` +
                `• \`.rpg start\` – New game\n` +
                `• \`.rpg explore\` – Explore for monsters/treasure\n` +
                `• \`.rpg attack\` – Attack current enemy\n` +
                `• \`.rpg potion\` – Use healing potion\n` +
                `• \`.rpg stats\` – View your stats\n` +
                `• \`.rpg guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *RPG Adventure Guide*\n\n` +
                `1. Start a game: \`.rpg start\`\n` +
                `2. Explore to find monsters and treasure\n` +
                `3. Fight monsters with \`.rpg attack\`\n` +
                `4. Use potions to heal: \`.rpg potion\`\n` +
                `5. Gain EXP and gold from battles\n` +
                `6. Level up to increase max HP!\n\n` +
                `*Stats:*\n` +
                `❤️ = Health | 🧪 = Potions | 💰 = Gold\n` +
                `⚔️ = Attack power | 🛡️ = Defense`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`rpg-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new RPGAdventure(senderId);
            const newKey = `rpg-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `⚔️ *RPG Adventure Started!*\n\n` +
                `${newGame.getDisplayBoard()}\n\n` +
                `Begin your journey with \`.rpg explore\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.rpg start`');

        if (subCmd === 'stats') {
            return await reply(game.getDisplayBoard());
        }

        if (subCmd === 'explore') {
            const result = game.explore();
            if (result.error) return await reply(`❌ ${result.error}`);
            
            if (result.type === 'monster') {
                await reply(
                    `⚔️ *A wild ${result.monster.name} appears!* ⚔️\n\n` +
                    `${game.getDisplayBoard()}`
                );
            } else if (result.type === 'treasure') {
                let msg = `✨ *You found treasure!* ✨\n\n`;
                if (result.treasure.type === 'gold') {
                    msg += `💰 +${result.treasure.amount} gold!`;
                } else if (result.treasure.type === 'potion') {
                    msg += `🧪 +1 healing potion!`;
                } else if (result.treasure.type === 'exp') {
                    msg += `✨ +${result.treasure.amount} EXP!`;
                }
                await reply(`${msg}\n\n${game.getDisplayBoard()}`);
            }
            return;
        }

        if (subCmd === 'attack') {
            const result = game.attack();
            if (result.error) return await reply(`❌ ${result.error}`);
            
            if (result.victory) {
                const levelUp = game.addExp(result.exp);
                let msg = `🎉 *Victory!* You defeated the ${result.enemy}! 🎉\n\n` +
                         `💰 +${result.gold} gold\n` +
                         `✨ +${result.exp} EXP`;
                if (levelUp) msg += `\n\n🌟 *LEVEL UP!* You are now level ${game.level}! 🌟`;
                
                await reply(`${msg}\n\n${game.getDisplayBoard()}`);
            } else {
                await reply(
                    `⚔️ *Combat continues!*\n\n` +
                    `You dealt ${result.playerDamage} damage!\n` +
                    `Enemy counter-attacked for ${result.enemyDamage} damage!\n\n` +
                    `${game.getDisplayBoard()}`
                );
            }
            return;
        }

        if (subCmd === 'potion') {
            const result = game.usePotion();
            if (result.error) return await reply(`❌ ${result.error}`);
            await reply(
                `🧪 *Potion used!* HP restored to ${result.hp}\n\n` +
                `${game.getDisplayBoard()}`
            );
            return;
        }

        await reply('❌ Unknown subcommand. Use `.rpg guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading rpg.js:', e.message); }

/* ===== rpg-ultra.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class RPGUltra {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.level = 1;
        this.exp = 0;
        this.expNeeded = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.mp = 50;
        this.maxMp = 50;
        this.gold = 100;
        this.inventory = {
            potion: 3,
            elixir: 1,
            sword: 1,
            shield: 1
        };
        this.equipment = {
            weapon: 'sword',
            armor: 'shield'
        };
        this.stats = {
            strength: 10,
            defense: 8,
            magic: 5,
            speed: 7
        };
        this.location = 'town'; // town, forest, cave, dungeon
        this.quests = [];
        this.currentEnemy = null;
        this.inBattle = false;
    }

    // Experience and leveling
    addExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.expNeeded;
        this.expNeeded = Math.floor(this.expNeeded * 1.5);
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.maxMp += 10;
        this.mp = this.maxMp;
        this.stats.strength += 3;
        this.stats.defense += 2;
        this.stats.magic += 2;
        this.stats.speed += 1;
    }

    // Movement
    move(location) {
        const locations = ['town', 'forest', 'cave', 'dungeon'];
        if (!locations.includes(location)) return false;
        this.location = location;
        return true;
    }

    // Exploration
    explore() {
        if (this.hp <= 0) return { error: 'You are defeated! Use `.rpg heal` to recover.' };
        
        const encounters = [
            { type: 'monster', rate: 0.6 },
            { type: 'treasure', rate: 0.3 },
            { type: 'nothing', rate: 0.1 }
        ];
        const rand = Math.random();
        let cumulative = 0;
        for (let e of encounters) {
            cumulative += e.rate;
            if (rand < cumulative) {
                if (e.type === 'monster') {
                    const monster = this.generateMonster();
                    this.currentEnemy = monster;
                    this.inBattle = true;
                    return { type: 'monster', monster };
                } else if (e.type === 'treasure') {
                    const treasure = this.generateTreasure();
                    this.applyTreasure(treasure);
                    return { type: 'treasure', treasure };
                } else {
                    return { type: 'nothing' };
                }
            }
        }
    }

    generateMonster() {
        const monsters = {
            forest: [
                { name: 'Goblin 👺', hp: 30, attack: 8, gold: 15, exp: 20 },
                { name: 'Wolf 🐺', hp: 45, attack: 12, gold: 25, exp: 35 }
            ],
            cave: [
                { name: 'Orc 👹', hp: 60, attack: 15, gold: 40, exp: 50 },
                { name: 'Troll 🧌', hp: 90, attack: 18, gold: 60, exp: 70 }
            ],
            dungeon: [
                { name: 'Dragon 🐉', hp: 150, attack: 25, gold: 200, exp: 150 },
                { name: 'Lich 💀', hp: 120, attack: 30, gold: 150, exp: 120 }
            ]
        };
        const locMonsters = monsters[this.location] || monsters.forest;
        const base = locMonsters[Math.floor(Math.random() * locMonsters.length)];
        return { ...base, currentHp: base.hp };
    }

    generateTreasure() {
        const treasures = [
            { type: 'gold', amount: 20 + Math.floor(Math.random() * 50) },
            { type: 'potion', amount: 1 },
            { type: 'elixir', amount: 1 },
            { type: 'exp', amount: 15 + Math.floor(Math.random() * 30) }
        ];
        return treasures[Math.floor(Math.random() * treasures.length)];
    }

    applyTreasure(treasure) {
        if (treasure.type === 'gold') this.gold += treasure.amount;
        else if (treasure.type === 'potion') this.inventory.potion += treasure.amount;
        else if (treasure.type === 'elixir') this.inventory.elixir += treasure.amount;
        else if (treasure.type === 'exp') this.addExp(treasure.amount);
    }

    // Battle actions
    attack() {
        if (!this.inBattle) return { error: 'Not in battle' };
        const playerDamage = Math.floor(this.stats.strength + Math.random() * 10);
        this.currentEnemy.currentHp -= playerDamage;

        if (this.currentEnemy.currentHp <= 0) {
            // Victory
            this.addExp(this.currentEnemy.exp);
            this.gold += this.currentEnemy.gold;
            const result = {
                victory: true,
                enemy: this.currentEnemy.name,
                exp: this.currentEnemy.exp,
                gold: this.currentEnemy.gold
            };
            this.currentEnemy = null;
            this.inBattle = false;
            return result;
        }

        // Enemy counter
        const enemyDamage = Math.floor(Math.random() * this.currentEnemy.attack);
        this.hp = Math.max(0, this.hp - enemyDamage);
        if (this.hp <= 0) {
            this.inBattle = false;
            return { defeat: true, enemy: this.currentEnemy.name };
        }

        return {
            playerDamage,
            enemyDamage,
            enemyHp: this.currentEnemy.currentHp,
            playerHp: this.hp
        };
    }

    useItem(item) {
        if (!this.inventory[item] || this.inventory[item] <= 0) return false;
        if (item === 'potion') {
            this.hp = Math.min(this.maxHp, this.hp + 50);
            this.inventory.potion--;
        } else if (item === 'elixir') {
            this.mp = Math.min(this.maxMp, this.mp + 30);
            this.inventory.elixir--;
        }
        return true;
    }

    flee() {
        if (!this.inBattle) return false;
        const chance = this.stats.speed / (this.stats.speed + this.currentEnemy.attack);
        if (Math.random() < chance) {
            this.inBattle = false;
            this.currentEnemy = null;
            return true;
        }
        // Failed flee, enemy attacks
        const enemyDamage = Math.floor(Math.random() * this.currentEnemy.attack);
        this.hp = Math.max(0, this.hp - enemyDamage);
        return false;
    }

    // Shop
    buy(item, cost) {
        if (this.gold < cost) return false;
        this.gold -= cost;
        if (!this.inventory[item]) this.inventory[item] = 0;
        this.inventory[item]++;
        return true;
    }

    sell(item, price) {
        if (!this.inventory[item] || this.inventory[item] <= 0) return false;
        this.inventory[item]--;
        this.gold += price;
        return true;
    }

    getDisplayBoard() {
        const hpBar = '❤️'.repeat(Math.ceil(this.hp / 10)) + '🖤'.repeat(10 - Math.ceil(this.hp / 10));
        const mpBar = '💙'.repeat(Math.ceil(this.mp / 10)) + '🖤'.repeat(5 - Math.ceil(this.mp / 10));

        let status = '';
        if (this.inBattle && this.currentEnemy) {
            const enemyHpBar = '💔'.repeat(Math.ceil(this.currentEnemy.currentHp / 10)) + '🖤'.repeat(10 - Math.ceil(this.currentEnemy.currentHp / 10));
            status = `⚔️ *BATTLE* ⚔️\n\n` +
                    `Enemy: ${this.currentEnemy.name}\n` +
                    `Enemy HP: ${enemyHpBar}\n\n` +
                    `Commands: \`.rpg attack\`, \`.rpg potion\`, \`.rpg flee\``;
        } else {
            status = `📍 Location: *${this.location}*\n` +
                    `Use \`.rpg explore\` to find adventure.`;
        }

        return `⚔️ *RPG-ULTRA* ⚔️\n\n` +
               `Player: ${this.playerName} (Lv.${this.level})\n` +
               `EXP: ${this.exp}/${this.expNeeded}\n` +
               `HP: ${hpBar} (${this.hp}/${this.maxHp})\n` +
               `MP: ${mpBar} (${this.mp}/${this.maxMp})\n` +
               `💰 Gold: ${this.gold}\n` +
               `🧪 Potions: ${this.inventory.potion}  |  ✨ Elixirs: ${this.inventory.elixir}\n\n` +
               status;
    }
}

const games = new Map(); // key = chatId:playerId

module.exports = {
    command: 'rpg',
    aliases: ['rpg-ultra'],
    category: 'games',
    description: 'Embark on an epic RPG adventure!',
    usage: 
        '.rpg start                  – Start a new game\n' +
        '.rpg explore                 – Explore current area\n' +
        '.rpg attack                   – Attack enemy in battle\n' +
        '.rpg potion                    – Use healing potion\n' +
        '.rpg elixir                     – Use MP elixir\n' +
        '.rpg flee                        – Flee from battle\n' +
        '.rpg move <location>            – Move to town/forest/cave/dungeon\n' +
        '.rpg shop                         – Show shop items\n' +
        '.rpg buy <item>                   – Buy item (potion/elixir)\n' +
        '.rpg stats                         – Show character stats\n' +
        '.rpg guide                           – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const senderName = message.pushName || senderId.split('@')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `⚔️ *RPG Commands*\n\n` +
                `• \`.rpg start\` – New game\n` +
                `• \`.rpg explore\` – Explore area\n` +
                `• \`.rpg attack\` – Attack enemy\n` +
                `• \`.rpg potion\` – Use potion\n` +
                `• \`.rpg elixir\` – Use elixir\n` +
                `• \`.rpg flee\` – Flee battle\n` +
                `• \`.rpg move <loc>\` – Move location\n` +
                `• \`.rpg shop\` – Show shop\n` +
                `• \`.rpg buy <item>\` – Buy item\n` +
                `• \`.rpg stats\` – View stats\n` +
                `• \`.rpg guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *RPG-Ultra Guide*\n\n` +
                `1. Start your adventure: \`.rpg start\`\n` +
                `2. Explore to find monsters and treasure\n` +
                `3. Fight monsters with \`.rpg attack\`\n` +
                `4. Use potions to heal, elixirs for MP\n` +
                `5. Flee if battle is too hard\n` +
                `6. Move between locations: town, forest, cave, dungeon\n` +
                `7. Buy items in town with \`.rpg shop\` and \`.rpg buy\`\n` +
                `8. Gain EXP and level up!\n\n` +
                `*Stats:*\n` +
                `❤️ HP | 💙 MP | 💰 Gold | 🧪 Potion | ✨ Elixir`
            );
        }

        const gameKey = `${chatId}:${senderId}`;
        let game = games.get(gameKey);

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            game = new RPGUltra(senderId, senderName);
            games.set(gameKey, game);
            return await reply(
                `⚔️ *RPG-Ultra Started!*\n\n` +
                `${game.getDisplayBoard()}\n\n` +
                `Begin with \`.rpg explore\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.rpg start`');

        if (subCmd === 'stats') {
            return await reply(game.getDisplayBoard());
        }

        if (subCmd === 'explore') {
            if (game.hp <= 0) return await reply('❌ You are defeated! Use `.rpg heal` to recover.');
            const result = game.explore();
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.type === 'monster') {
                await reply(
                    `⚔️ *A wild ${result.monster.name} appears!* ⚔️\n\n` +
                    `${game.getDisplayBoard()}`
                );
            } else if (result.type === 'treasure') {
                let msg = `✨ *You found treasure!* ✨\n\n`;
                if (result.treasure.type === 'gold') msg += `💰 +${result.treasure.amount} gold!`;
                else if (result.treasure.type === 'potion') msg += `🧪 +1 potion!`;
                else if (result.treasure.type === 'elixir') msg += `✨ +1 elixir!`;
                else if (result.treasure.type === 'exp') msg += `✨ +${result.treasure.amount} EXP!`;
                await reply(`${msg}\n\n${game.getDisplayBoard()}`);
            } else {
                await reply(`🍃 You found nothing interesting.\n\n${game.getDisplayBoard()}`);
            }
            return;
        }

        if (subCmd === 'attack') {
            const result = game.attack();
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.victory) {
                await reply(
                    `🎉 *Victory!* You defeated ${result.enemy}!\n` +
                    `💰 +${result.gold} gold  ✨ +${result.exp} EXP\n\n` +
                    `${game.getDisplayBoard()}`
                );
            } else if (result.defeat) {
                await reply(
                    `💀 *You were defeated by ${result.enemy}!*\n\n` +
                    `${game.getDisplayBoard()}\n\n` +
                    `Use potions to heal.`
                );
            } else {
                await reply(
                    `⚔️ You dealt ${result.playerDamage} damage!\n` +
                    `💥 Enemy counter: ${result.enemyDamage} damage!\n\n` +
                    `${game.getDisplayBoard()}`
                );
            }
            return;
        }

        if (subCmd === 'potion') {
            const used = game.useItem('potion');
            if (!used) return await reply('❌ No potions left!');
            await reply(`🧪 *Potion used!* HP restored.\n\n${game.getDisplayBoard()}`);
            return;
        }

        if (subCmd === 'elixir') {
            const used = game.useItem('elixir');
            if (!used) return await reply('❌ No elixirs left!');
            await reply(`✨ *Elixir used!* MP restored.\n\n${game.getDisplayBoard()}`);
            return;
        }

        if (subCmd === 'flee') {
            if (!game.inBattle) return await reply('❌ Not in battle.');
            const success = game.flee();
            if (success) {
                await reply(`🏃 *You fled successfully!*\n\n${game.getDisplayBoard()}`);
            } else {
                await reply(`💥 *Failed to flee!* Enemy attacked!\n\n${game.getDisplayBoard()}`);
            }
            return;
        }

        if (subCmd === 'move') {
            if (args.length < 2) return await reply('❌ Usage: `.rpg move <town/forest/cave/dungeon>`');
            const loc = args[1].toLowerCase();
            const success = game.move(loc);
            if (!success) return await reply(`❌ Invalid location. Choose: town, forest, cave, dungeon.`);
            await reply(`📍 Moved to *${loc}*.\n\n${game.getDisplayBoard()}`);
            return;
        }

        if (subCmd === 'shop') {
            return await reply(
                `🏪 *SHOP*\n\n` +
                `🟢 Potion: 30 gold (heal 50 HP)\n` +
                `🔵 Elixir: 50 gold (restore 30 MP)\n` +
                `🛡️ Shield: 100 gold (+2 defense)\n` +
                `⚔️ Sword: 150 gold (+3 strength)\n\n` +
                `Use \`.rpg buy <item>\` to purchase.\n` +
                `Your gold: ${game.gold}`
            );
        }

        if (subCmd === 'buy') {
            if (args.length < 2) return await reply('❌ Usage: `.rpg buy <item>`');
            const item = args[1].toLowerCase();
            const prices = { potion: 30, elixir: 50, shield: 100, sword: 150 };
            if (!prices[item]) return await reply('❌ Item not available. Choose potion, elixir, shield, sword.');
            if (game.gold < prices[item]) return await reply('❌ Not enough gold.');
            game.gold -= prices[item];
            if (item === 'shield' || item === 'sword') {
                game.inventory[item] = (game.inventory[item] || 0) + 1;
            } else {
                game.inventory[item]++;
            }
            await reply(`✅ Purchased 1 ${item}! Remaining gold: ${game.gold}\n\n${game.getDisplayBoard()}`);
            return;
        }

        await reply('❌ Unknown subcommand. Use `.rpg guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading rpg-ultra.js:', e.message); }

/* ===== towerdefense.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

class TowerDefense {
    constructor() {
        this.wave = 1;
        this.lives = 10;
        this.gold = 200;
        this.towers = [];
        this.enemies = [];
        this.path = [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2]]; // simplified path
        this.gameOver = false;
        this.spawnTimer = 0;
    }

    spawnEnemy() {
        const health = 20 + this.wave * 5;
        const speed = 1;
        this.enemies.push({
            hp: health,
            maxHp: health,
            position: 0, // index in path
            speed
        });
    }

    update() {
        // Move enemies
        for (let e of this.enemies) {
            e.position += e.speed;
            if (e.position >= this.path.length) {
                // reached end
                this.lives--;
                this.enemies = this.enemies.filter(en => en !== e);
                if (this.lives <= 0) this.gameOver = true;
            }
        }

        // Towers attack
        for (let t of this.towers) {
            // Find nearest enemy in range (simplified)
            const enemy = this.enemies.find(e => {
                const pos = this.path[e.position];
                const dist = Math.abs(pos[0] - t.row) + Math.abs(pos[1] - t.col);
                return dist <= t.range;
            });
            if (enemy) {
                enemy.hp -= t.damage;
                if (enemy.hp <= 0) {
                    this.enemies = this.enemies.filter(e => e !== enemy);
                    this.gold += 10;
                }
            }
        }
    }

    buyTower(row, col) {
        const cost = 50;
        if (this.gold < cost) return false;
        // Check if spot is valid (not on path, not occupied)
        const onPath = this.path.some(([r,c]) => r === row && c === col);
        if (onPath) return false;
        if (this.towers.some(t => t.row === row && t.col === col)) return false;
        this.towers.push({ row, col, range: 3, damage: 10 });
        this.gold -= cost;
        return true;
    }

    nextWave() {
        this.wave++;
        for (let i = 0; i < 5 + this.wave; i++) {
            this.spawnEnemy();
        }
    }

    getDisplayBoard() {
        // Create 10x5 grid
        let grid = Array(5).fill().map(() => Array(10).fill('⬜'));
        // Path
        for (let [c,r] of this.path) { // note: path stored as [col,row]? We'll assume [col,row] = (c,r)
            if (r >= 0 && r < 5 && c >= 0 && c < 10) {
                grid[r][c] = '🟫';
            }
        }
        // Towers
        for (let t of this.towers) {
            if (t.row >= 0 && t.row < 5 && t.col >= 0 && t.col < 10) {
                grid[t.row][t.col] = '🏰';
            }
        }
        // Enemies
        for (let e of this.enemies) {
            const [c,r] = this.path[e.position];
            if (r >= 0 && r < 5 && c >= 0 && c < 10) {
                grid[r][c] = '👾';
            }
        }

        let board = '```\n   ';
        for (let c = 0; c < 10; c++) board += (c+1) + ' ';
        board += '\n';
        for (let r = 0; r < 5; r++) {
            board += (r+1).toString().padStart(2) + ' ';
            for (let c = 0; c < 10; c++) {
                board += grid[r][c] + ' ';
            }
            board += '\n';
        }
        board += '```\n';
        board += `Wave: ${this.wave}  ❤️ Lives: ${this.lives}  💰 Gold: ${this.gold}`;
        return board;
    }
}

const games = new Map(); // key = chatId:playerId

module.exports = {
    command: 'tower',
    aliases: ['td'],
    category: 'games',
    description: 'Defend your base from waves of enemies.',
    usage: 
        '.td start                   – Start a new game\n' +
        '.td buy <row> <col>          – Buy a tower (1-5 rows, 1-10 cols)\n' +
        '.td wave                      – Start next wave\n' +
        '.td guide                      – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🏰 *Tower Defense Commands*\n\n` +
                `• \`.td start\` – New game\n` +
                `• \`.td buy <row> <col>\` – Place tower (1-5, 1-10)\n` +
                `• \`.td wave\` – Start next wave\n` +
                `• \`.td guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();
        const gameKey = `${chatId}:${senderId}`;
        let game = games.get(gameKey);

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Tower Defense Guide*\n\n` +
                `1. Start a game: \`.td start\`\n` +
                `2. Place towers on empty (⬜) squares: \`.td buy <row> <col>\`\n` +
                `3. Towers cost 50 gold each\n` +
                `4. Start a wave with \`.td wave\`\n` +
                `5. Enemies (👾) move along the brown path\n` +
                `6. If they reach the end, you lose lives\n` +
                `7. Survive as many waves as possible!`
            );
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            game = new TowerDefense();
            games.set(gameKey, game);
            return await reply(
                `🏰 *Tower Defense Started!*\n\n${game.getDisplayBoard()}\n\n` +
                `Place towers with \`.td buy <row> <col>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.td start`');

        if (subCmd === 'buy') {
            if (args.length < 3) return await reply('❌ Usage: `.td buy <row> <col>`');
            const row = parseInt(args[1]) - 1;
            const col = parseInt(args[2]) - 1;
            if (isNaN(row) || isNaN(col) || row < 0 || row >= 5 || col < 0 || col >= 10) {
                return await reply('❌ Row must be 1-5, Column 1-10.');
            }
            const success = game.buyTower(row, col);
            if (!success) return await reply('❌ Cannot place tower there (on path, occupied, or insufficient gold).');
            await reply(game.getDisplayBoard());
            return;
        }

        if (subCmd === 'wave') {
            game.nextWave();
            // Simulate updates (simplified – we'd ideally have a loop)
            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.td guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading towerdefense.js:', e.message); }

/* ===== slot.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
const payouts = {
  '🍒': 2,
  '🍋': 3,
  '🍊': 4,
  '🍇': 5,
  '💎': 10,
  '7️⃣': 20
};

class SlotMachine {
    constructor() {
        this.balance = 100;
        this.lastSpin = null;
        this.spinning = false;
    }

    spin(bet = 10) {
        if (this.spinning) return { error: 'Already spinning!' };
        if (bet > this.balance) return { error: 'Insufficient balance' };
        if (bet < 5) return { error: 'Minimum bet is 5' };

        this.spinning = true;
        this.balance -= bet;

        // Generate result
        const reels = [
            slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
            slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
            slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
        ];

        // Check win (all three same)
        const win = reels[0] === reels[1] && reels[1] === reels[2];
        const multiplier = win ? payouts[reels[0]] || 2 : 0;
        const winnings = win ? bet * multiplier : 0;

        if (win) this.balance += winnings;

        this.lastSpin = { reels, win, winnings, bet };
        return { reels, win, winnings, bet };
    }

    getDisplayBoard(spinning = false) {
        if (spinning) {
            return `🎰 *SLOT MACHINE* 🎰\n\n` +
                   `[ 🎲 | 🎲 | 🎲 ]\n` +
                   `[ 🎰 | ⏳ | 🎰 ]\n` +
                   `[ 🎲 | 🎲 | 🎲 ]\n\n` +
                   `*SPINNING...*`;
        }

        const spin = this.lastSpin || { reels: ['❓', '❓', '❓'] };
        const result = spin.reels.map(r => r).join(' | ');
        
        let status = '';
        if (spin.win) {
            status = `\n\n🎉 *YOU WIN ${spin.winnings}!* 🎉`;
        } else if (spin.winnings !== undefined) {
            status = `\n\n😢 *Try again!*`;
        }

        return `🎰 *SLOT MACHINE* 🎰\n\n` +
               `[ ${spin.reels[0]} | ${spin.reels[1]} | ${spin.reels[2]} ]\n\n` +
               `Balance: 💰 ${this.balance}` +
               status;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `slot-${chatId}:${player}`

module.exports = {
    command: 'slot',
    aliases: ['slots'],
    category: 'games',
    description: 'Play the slot machine with emoji reels.',
    usage: 
        '.slot start                – Start a new game\n' +
        '.slot spin <bet>            – Spin the reels (bet 5-100)\n' +
        '.slot guide                  – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🎰 *Slot Machine Commands*\n\n` +
                `• \`.slot start\` – New game\n` +
                `• \`.slot spin <bet>\` – Spin (bet 5-100)\n` +
                `• \`.slot guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Slot Machine Guide*\n\n` +
                `1. Start a game: \`.slot start\` (get 100 chips)\n` +
                `2. Spin with: \`.slot spin 10\`\n` +
                `3. Match all three symbols to win!\n` +
                `4. Payouts: 🍒=2x, 🍋=3x, 🍊=4x, 🍇=5x, 💎=10x, 7️⃣=20x\n` +
                `5. Watch the animation as reels spin!\n` +
                `6. Balance persists until you start a new game.`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`slot-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new SlotMachine();
            const newKey = `slot-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🎰 *Slot Machine Started!*\n\n` +
                `${newGame.getDisplayBoard()}\n\n` +
                `Spin with \`.slot spin <bet>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.slot start`');

        if (subCmd === 'spin') {
            if (args.length < 2) return await reply('❌ Usage: `.slot spin <bet>`');
            const bet = parseInt(args[1]);
            if (isNaN(bet)) return await reply('❌ Bet must be a number');

            // Show spinning animation
            const spinMsg = await reply(game.getDisplayBoard(true));
            
            // Simulate spinning delay
            setTimeout(async () => {
                const result = game.spin(bet);
                if (result.error) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ ${result.error}`, 
                        ...channelInfo,
                        edit: spinMsg.key?.id 
                    });
                    return;
                }

                // Send final result
                await sock.sendMessage(chatId, { 
                    text: game.getDisplayBoard(), 
                    ...channelInfo,
                    edit: spinMsg.key?.id 
                });

                // If game over (optional), could end here
            }, 2000);
            
            return;
        }

        await reply('❌ Unknown subcommand. Use `.slot guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading slot.js:', e.message); }

/* ===== roll.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/roll.js
module.exports = {
  command: 'roll',
  aliases: ['dice', 'd'],
  category: 'game',
  description: 'Roll a dice. Usage: .roll 2d6',
  usage: '.roll [ndn] (e.g., .roll 2d6)',
  
  async handler(sock, message, args, context) {
    const { chatId } = context;
    let sides = 6, count = 1;
    
    if (args.length) {
      const match = args[0].match(/^(\d+)d(\d+)$/i);
      if (match) {
        count = parseInt(match[1]);
        sides = parseInt(match[2]);
        if (count > 100) count = 100; // limit
      } else {
        return await sock.sendMessage(chatId, {
          text: '❌ Invalid format. Use e.g., .roll 2d6'
        }, { quoted: message });
      }
    }

    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const result = count === 1 ? `🎲 You rolled: **${rolls[0]}**` 
                               : `🎲 Rolls: ${rolls.join(', ')}\n📊 Total: **${total}**`;

    await sock.sendMessage(chatId, { text: result }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading roll.js:', e.message); }

/* ===== dice.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class LudoDice {
    constructor() {
        this.players = [];
        this.currentPlayer = 0;
        this.rolls = [];
        this.gameOver = false;
        this.winner = null;
    }

    addPlayer(playerId, name) {
        if (this.players.length >= 4) return false;
        this.players.push({ id: playerId, name, position: 0, pieces: [0,0,0,0] }); // 4 pieces
        return true;
    }

    roll() {
        const dice = Math.floor(Math.random() * 6) + 1;
        return dice;
    }

    move(playerIndex, pieceIndex) {
        const player = this.players[playerIndex];
        const dice = this.rolls[this.rolls.length-1];
        // Simplified: just move piece forward, no complex rules
        player.pieces[pieceIndex] += dice;
        if (player.pieces[pieceIndex] >= 57) { // approximate win condition
            this.gameOver = true;
            this.winner = player;
        }
    }

    nextTurn() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    getDisplayBoard() {
        let board = '🎲 *LUDO DICE* 🎲\n\n';
        this.players.forEach((p, i) => {
            board += `${i === this.currentPlayer ? '👉 ' : '   '}${p.name}: `;
            p.pieces.forEach((pos, j) => {
                board += `[${pos}] `;
            });
            board += '\n';
        });
        return board;
    }

    getDiceEmoji(roll) {
        const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return dice[roll-1];
    }
}

const games = new Map(); // key = chatId

module.exports = {
    command: 'dice',
    aliases: ['ludo'],
    category: 'games',
    description: 'Play Ludo-style dice game (up to 4 players).',
    usage: 
        '.dice start                – Start a new game\n' +
        '.dice join                  – Join the game\n' +
        '.dice roll                   – Roll the dice\n' +
        '.dice move <piece>           – Move piece (1-4)\n' +
        '.dice guide                   – Show game guide',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const senderName = message.pushName || senderId.split('@')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🎲 *Dice Commands*\n\n` +
                `• \`.dice start\` – Host a new game\n` +
                `• \`.dice join\` – Join waiting game\n` +
                `• \`.dice roll\` – Roll the dice\n` +
                `• \`.dice move <piece>\` – Move piece (1-4)\n` +
                `• \`.dice guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Dice Game Guide*\n\n` +
                `1. Host starts a game: \`.dice start\`\n` +
                `2. Players join with \`.dice join\` (max 4)\n` +
                `3. Players take turns rolling with \`.dice roll\`\n` +
                `4. After rolling, move a piece: \`.dice move 1\`\n` +
                `5. First to get all pieces around the board wins!\n` +
                `6. Dice roll shown as 🎲 emoji.`
            );
        }

        let game = games.get(chatId);

        if (subCmd === 'start') {
            if (game) games.delete(chatId);
            game = new LudoDice();
            game.addPlayer(senderId, senderName);
            games.set(chatId, game);
            return await reply(
                `🎲 *Dice Game Started!*\n\n` +
                `${game.getDisplayBoard()}\n\n` +
                `Players can join with \`.dice join\`\n` +
                `Use \`.dice roll\` when it's your turn.`,
                [senderId]
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.dice start`');

        if (subCmd === 'join') {
            if (game.players.length >= 4) return await reply('❌ Game is full (max 4 players).');
            if (game.players.some(p => p.id === senderId)) return await reply('❌ You are already in the game.');
            game.addPlayer(senderId, senderName);
            await reply(
                `✅ @${senderName} joined!\n\n${game.getDisplayBoard()}`,
                game.players.map(p => p.id)
            );
            return;
        }

        if (subCmd === 'roll') {
            const playerIndex = game.players.findIndex(p => p.id === senderId);
            if (playerIndex !== game.currentPlayer) return await reply('❌ Not your turn!');
            
            const roll = game.roll();
            game.rolls.push(roll);
            const diceEmoji = game.getDiceEmoji(roll);
            
            const rollMsg = await reply(`🎲 *Rolling...* ${diceEmoji}`);
            
            setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: `🎲 You rolled ${diceEmoji} (${roll})!\nNow move a piece with \`.dice move <piece>\``,
                    ...channelInfo,
                    edit: rollMsg.key?.id
                });
            }, 1000);
            return;
        }

        if (subCmd === 'move') {
            if (args.length < 2) return await reply('❌ Usage: `.dice move <piece>`');
            const piece = parseInt(args[1]);
            if (isNaN(piece) || piece < 1 || piece > 4) return await reply('❌ Piece must be 1-4.');

            const playerIndex = game.players.findIndex(p => p.id === senderId);
            if (playerIndex !== game.currentPlayer) return await reply('❌ Not your turn!');
            if (game.rolls.length === 0) return await reply('❌ You need to roll first!');

            game.move(playerIndex, piece-1);
            
            let msg = game.getDisplayBoard();
            if (game.gameOver) {
                msg += `\n\n🏆 *${game.winner.name} wins!* 🏆`;
                games.delete(chatId);
            } else {
                game.nextTurn();
                msg += `\n\nNext turn: ${game.players[game.currentPlayer].name}`;
            }
            await reply(msg, game.players.map(p => p.id));
            return;
        }

        await reply('❌ Unknown subcommand. Use `.dice guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading dice.js:', e.message); }

/* ===== coin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
class CoinFlip {
    constructor(creator) {
        this.players = [creator, null];
        this.choices = [null, null];
        this.stage = 'waiting'; // waiting, choosing, flipping, done
        this.winner = null;
        this.bet = 0;
    }

    join(player) {
        if (this.players[1]) return { error: 'Game is full' };
        this.players[1] = player;
        this.stage = 'choosing';
        return { success: true };
    }

    choose(player, choice) {
        const idx = this.players.indexOf(player);
        if (idx === -1) return { error: 'Not a player' };
        if (this.stage !== 'choosing') return { error: 'Not choosing phase' };
        if (choice !== 'heads' && choice !== 'tails') return { error: 'Choose heads or tails' };

        this.choices[idx] = choice;
        
        if (this.choices[0] && this.choices[1]) {
            this.stage = 'flipping';
        }
        return { success: true, both: this.choices[0] && this.choices[1] };
    }

    flip() {
        if (this.stage !== 'flipping') return { error: 'Not flipping phase' };
        
        // Animated flip sequence
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        
        // Determine winner
        if (this.choices[0] === result && this.choices[1] === result) {
            // Both guessed same, tie
            this.winner = null;
        } else if (this.choices[0] === result) {
            this.winner = this.players[0];
        } else if (this.choices[1] === result) {
            this.winner = this.players[1];
        }
        
        this.stage = 'done';
        return { success: true, result };
    }

    getDisplayBoard(flipping = false) {
        const player1Name = this.players[0]?.split('@')[0] || 'Waiting';
        const player2Name = this.players[1]?.split('@')[0] || 'Waiting';

        let status = '';
        if (this.stage === 'waiting') {
            status = `⏳ Waiting for opponent...\nJoin with \`.coin join\``;
        } else if (this.stage === 'choosing') {
            status = `🪙 Choose heads or tails:\n`;
            if (!this.choices[0]) status += `• ${player1Name}: waiting\n`;
            else status += `• ${player1Name}: ✅ chosen\n`;
            if (!this.choices[1]) status += `• ${player2Name}: waiting\n`;
            else status += `• ${player2Name}: ✅ chosen\n`;
            status += `\nUse \`.coin heads\` or \`.coin tails\``;
        } else if (this.stage === 'flipping') {
            status = flipping ? `🪙 *FLIPPING...*` : `🪙 Ready to flip! Use \`.coin flip\``;
        } else if (this.stage === 'done') {
            if (this.winner) {
                const winnerName = this.winner.split('@')[0];
                status = `🎉 *${winnerName} wins!* 🎉`;
            } else {
                status = `🤝 *It's a tie!* 🤝`;
            }
        }

        return `🪙 *COIN FLIP DUEL* 🪙\n\n` +
               `${player1Name}  vs  ${player2Name}\n\n` +
               status;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `coin-${chatId}`

module.exports = {
    command: 'coin',
    aliases: ['coinflip', 'flip'],
    category: 'games',
    description: 'Flip a coin against another player.',
    usage: 
        '.coin start                 – Start a new game\n' +
        '.coin join                   – Join waiting game\n' +
        '.coin heads / .coin tails    – Choose your side\n' +
        '.coin flip                    – Flip the coin\n' +
        '.coin guide                    – Show game guide',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text, mentions = []) => 
            await sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🪙 *Coin Flip Commands*\n\n` +
                `• \`.coin start\` – Host a new game\n` +
                `• \`.coin join\` – Join waiting game\n` +
                `• \`.coin heads/tails\` – Choose your side\n` +
                `• \`.coin flip\` – Flip the coin\n` +
                `• \`.coin guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Coin Flip Guide*\n\n` +
                `1. Host a game: \`.coin start\`\n` +
                `2. Opponent joins: \`.coin join\`\n` +
                `3. Each player chooses heads or tails\n` +
                `4. Host flips the coin: \`.coin flip\`\n` +
                `5. Winner is the one who guessed correctly\n` +
                `6. Watch the coin spin animation!`
            );
        }

        // Find existing game in this chat
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`coin-${chatId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new CoinFlip(senderId);
            const newKey = `coin-${chatId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🪙 *Coin Flip Started!*\n\n` +
                `${newGame.getDisplayBoard()}\n\n` +
                `Waiting for opponent to join with \`.coin join\``,
                [senderId]
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.coin start`');

        if (subCmd === 'join') {
            const result = game.join(senderId);
            if (result.error) return await reply(`❌ ${result.error}`);
            await reply(
                `${game.getDisplayBoard()}\n\n` +
                `Both players now choose heads or tails`,
                game.players
            );
            return;
        }

        if (subCmd === 'heads' || subCmd === 'tails') {
            const result = game.choose(senderId, subCmd);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.both) {
                await reply(
                    `${game.getDisplayBoard()}\n\n` +
                    `Both chose! Host can now flip with \`.coin flip\``,
                    game.players
                );
            } else {
                await reply(
                    `${game.getDisplayBoard()}\n\n` +
                    `Choice recorded. Waiting for opponent...`,
                    game.players
                );
            }
            return;
        }

        if (subCmd === 'flip') {
            if (game.stage !== 'flipping') {
                return await reply('❌ Both players must choose first');
            }

            // Animated flip sequence
            const flipMsg = await reply('🪙 *FLIPPING...*\n\n🪙\n\n🔄');
            
            // Update animation frames
            setTimeout(async () => {
                await sock.sendMessage(chatId, { 
                    text: '🪙 *FLIPPING...*\n\n  🪙\n\n↪️', 
                    ...channelInfo,
                    edit: flipMsg.key?.id 
                });
            }, 400);
            
            setTimeout(async () => {
                await sock.sendMessage(chatId, { 
                    text: '🪙 *FLIPPING...*\n\n    🪙\n\n⤴️', 
                    ...channelInfo,
                    edit: flipMsg.key?.id 
                });
            }, 800);
            
            setTimeout(async () => {
                await sock.sendMessage(chatId, { 
                    text: '🪙 *FLIPPING...*\n\n🪙\n\n✨', 
                    ...channelInfo,
                    edit: flipMsg.key?.id 
                });
            }, 1200);
            
            setTimeout(async () => {
                const result = game.flip();
                const resultText = result.result === 'heads' ? '🪙 HEADS' : '🪙 TAILS';
                await sock.sendMessage(chatId, { 
                    text: `${game.getDisplayBoard()}\n\nResult: *${resultText}*`, 
                    ...channelInfo,
                    edit: flipMsg.key?.id 
                });
                
                // Remove game after delay
                setTimeout(() => games.delete(gameKey), 10000);
            }, 1600);
            
            return;
        }

        await reply('❌ Unknown subcommand. Use `.coin guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading coin.js:', e.message); }

/* ===== game.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/game.js
const axios = require('axios');

// Helper to download image from URL
async function getImageBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
  return Buffer.from(res.data);
}

module.exports = [
  {
    command: 'tebakbendera',
    aliases: ['guessflag'],
    category: 'game',
    description: 'Guess the country from its flag',
    usage: '.tebakbendera',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/game/tebakbendera', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        const { img, name } = data.result;
        const buffer = await getImageBuffer(img);
        const caption = `🇺🇳 *Guess the Country*\n\nWhat country is this flag from?\n\n_Send your answer as a reply._\n_Use .answer <country> to check._`;
        // Store the correct answer in a global map for later checking
        if (!global.games) global.games = {};
        global.games[chatId] = { type: 'flag', answer: name.toLowerCase() };
        await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: message });
      } catch (err) {
        console.error('Flag game error:', err);
        sock.sendMessage(chatId, { text: '❌ Failed to load flag game.' }, { quoted: message });
      }
    }
  },
  {
    command: 'tebakanime',
    aliases: ['guessanime'],
    category: 'game',
    description: 'Guess the anime from a character image',
    usage: '.tebakanime',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/game/tebakanime', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        const { soal, jawaban } = data.result;
        const buffer = await getImageBuffer(soal);
        const caption = `🎌 *Guess the Anime*\n\nWhich anime is this character from?\n\n_Send your answer as a reply._\n_Use .answer <name> to check._`;
        if (!global.games) global.games = {};
        global.games[chatId] = { type: 'anime', answer: jawaban.toLowerCase() };
        await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: message });
      } catch (err) {
        console.error('Anime game error:', err);
        sock.sendMessage(chatId, { text: '❌ Failed to load anime game.' }, { quoted: message });
      }
    }
  },
  {
    command: 'answer',
    aliases: ['guess'],
    category: 'game',
    description: 'Answer the current guessing game',
    usage: '.answer <your guess>',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      const guess = args.join(' ').toLowerCase();
      if (!guess) {
        return sock.sendMessage(chatId, { text: '❌ Provide your guess: .answer <answer>' }, { quoted: message });
      }
      const game = global.games?.[chatId];
      if (!game) {
        return sock.sendMessage(chatId, { text: '❌ No active game. Start one with .tebakbendera or .tebakanime' }, { quoted: message });
      }
      const isCorrect = guess === game.answer;
      const result = isCorrect ? '✅ Correct!' : `❌ Wrong! The correct answer is *${game.answer}*.`;
      await sock.sendMessage(chatId, { text: result }, { quoted: message });
      delete global.games[chatId];
    }
  }
];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading game.js:', e.message); }

/* ===== wordcloud.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);
const WA_LIMIT = 60000;

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

async function sendResult(sock, chatId, channelInfo, message, text, filename) {
    if (text.length > WA_LIMIT) {
        const tmpFile = path.join(process.cwd(), 'temp', filename);
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
        fs.writeFileSync(tmpFile, text);
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tmpFile),
            mimetype: 'text/plain',
            fileName: filename,
            caption: '📝 Result too large for WhatsApp, sent as file.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch {}
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

function formatResult(d) {
    const bar = (count, max) => {
        const filled = Math.round((count / max) * 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
    };

    const maxCount = d.top_words?.[0]?.count || 1;

    let topWordsText = '';
    if (d.top_words?.length) {
        topWordsText = d.top_words.map((w, i) =>
            `${String(i + 1).padStart(2, ' ')}. ${w.word.padEnd(15)} ${bar(w.count, maxCount)} ${w.count}x`
        ).join('\n');
    }

    return `📝 *Word Cloud Analysis*\n\n` +
           `━━━━━━ 📊 Stats ━━━━━━\n` +
           `📖 *Total words:* ${d.total_words?.toLocaleString()}\n` +
           `🔤 *Unique words:* ${d.unique_words?.toLocaleString()}\n` +
           `📝 *Characters:* ${d.total_chars?.toLocaleString()}\n` +
           `📜 *Sentences:* ${d.sentences}\n` +
           `📄 *Paragraphs:* ${d.paragraphs}\n` +
           `⏱️ *Reading time:* ${d.reading_time}\n` +
           `🎯 *Lexical diversity:* ${d.lexical_diversity}%\n` +
           `📏 *Avg word length:* ${d.avg_word_len} chars\n\n` +
           `━━━━━━ 🏆 Top Words ━━━━━━\n` +
           `\`\`\`\n${topWordsText}\n\`\`\``;
}

module.exports = {
    command: 'wordcloud',
    aliases: ['wordfreq', 'topwords', 'wordcount'],
    category: 'utility',
    description: 'Analyze text and show top 20 most used words with stats',
    usage: '.wordcloud <text or reply to any message/file>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'wordcloud.py');

        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ wordcloud.py not found in lib/. Please check installation.`,
                ...channelInfo
            }, { quoted: message });
        }

        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;

        const textInput = args.join(' ').trim() || quotedText;

        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `📝 *Word Cloud Analyzer*\n\n` +
                      `*Usage:*\n` +
                      `\`.wordcloud <paste any text here>\`\n\n` +
                      `*Or reply to:*\n` +
                      `• Any text message\n` +
                      `• A .txt or document file\n\n` +
                      `*Output includes:*\n` +
                      `📊 Word count, unique words, sentences\n` +
                      `🏆 Top 20 most used words\n` +
                      `⏱️ Reading time estimate\n` +
                      `📖 Lexical diversity score`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: '🔍 Analyzing text...', ...channelInfo }, { quoted: message });

        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();

        try {
            let cmd;

            if (hasDoc && quoted) {
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;

                const { stdout } = await execAsync(cmd, { timeout: 30000 });
                try { fs.unlinkSync(tmpFile); } catch {}

                const data = JSON.parse(stdout.trim());
                if (data.error) {
                    return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `wordcloud_${id}.txt`);
            } else {
                const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
                fs.writeFileSync(tmpFile, textInput);
                cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;

                const { stdout } = await execAsync(cmd, { timeout: 30000 });
                try { fs.unlinkSync(tmpFile); } catch {}

                const data = JSON.parse(stdout.trim());
                if (data.error) {
                    return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `wordcloud_${id}.txt`);
            }

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Analysis failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading wordcloud.js:', e.message); }

/* ===== wordsearch.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

class WordSearch {
    constructor(size = 10) {
        this.size = size;
        this.grid = this.createEmptyGrid();
        this.words = [];
        this.foundWords = [];
        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.gameOver = false;
    }

    createEmptyGrid() {
        return Array(this.size).fill().map(() => Array(this.size).fill(''));
    }

    addWord(word) {
        word = word.toUpperCase();
        if (word.length > this.size) return false;
        
        // Try to place horizontally or vertically
        const directions = [
            { dr: 0, dc: 1 }, // right
            { dr: 1, dc: 0 }  // down
        ];
        
        for (let attempt = 0; attempt < 100; attempt++) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const maxRow = dir.dr === 0 ? this.size : this.size - word.length;
            const maxCol = dir.dc === 0 ? this.size - word.length : this.size;
            if (maxRow < 0 || maxCol < 0) continue;
            
            const r = Math.floor(Math.random() * maxRow);
            const c = Math.floor(Math.random() * maxCol);
            
            // Check if cells are empty or matching
            let conflict = false;
            for (let i = 0; i < word.length; i++) {
                const nr = r + i * dir.dr;
                const nc = c + i * dir.dc;
                if (this.grid[nr][nc] !== '' && this.grid[nr][nc] !== word[i]) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) continue;
            
            // Place word
            for (let i = 0; i < word.length; i++) {
                const nr = r + i * dir.dr;
                const nc = c + i * dir.dc;
                this.grid[nr][nc] = word[i];
            }
            this.words.push(word);
            return true;
        }
        return false;
    }

    fillRemaining() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === '') {
                    this.grid[r][c] = this.letters[Math.floor(Math.random() * this.letters.length)];
                }
            }
        }
    }

    findWord(word) {
        word = word.toUpperCase();
        if (this.foundWords.includes(word)) return false;
        if (!this.words.includes(word)) return false;
        
        // Check all directions
        const dirs = [
            [0,1], [1,0], [0,-1], [-1,0],
            [1,1], [1,-1], [-1,1], [-1,-1]
        ];
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                for (let [dr, dc] of dirs) {
                    let found = true;
                    for (let i = 0; i < word.length; i++) {
                        const nr = r + i * dr;
                        const nc = c + i * dc;
                        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size || this.grid[nr][nc] !== word[i]) {
                            found = false;
                            break;
                        }
                    }
                    if (found) {
                        this.foundWords.push(word);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getDisplayBoard() {
        let board = '```\n   ';
        for (let c = 0; c < this.size; c++) board += (c+1).toString().padStart(2, ' ') + ' ';
        board += '\n';
        for (let r = 0; r < this.size; r++) {
            board += (r+1).toString().padStart(2, ' ') + ' ';
            for (let c = 0; c < this.size; c++) {
                board += ' ' + this.grid[r][c] + ' ';
            }
            board += '\n';
        }
        board += '```\n\n';
        board += `Words to find: ${this.words.join(', ')}\n`;
        board += `Found: ${this.foundWords.join(', ') || 'None'}`;
        return board;
    }
}

const games = new Map(); // key = chatId:playerId

module.exports = {
    command: 'wordsearch',
    aliases: ['ws'],
    category: 'games',
    description: 'Find hidden words in a letter grid.',
    usage: 
        '.ws start [size]            – Start a new game (size 8-15)\n' +
        '.ws find <word>               – Try to find a word\n' +
        '.ws guide                       – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🔍 *Word Search Commands*\n\n` +
                `• \`.ws start [size]\` – New game (size 8-15, default 10)\n` +
                `• \`.ws find <word>\` – Find a word\n` +
                `• \`.ws guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();
        const gameKey = `${chatId}:${senderId}`;
        let game = games.get(gameKey);

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Word Search Guide*\n\n` +
                `1. Start a game: \`.ws start 10\`\n` +
                `2. A grid of letters will appear\n` +
                `3. Words are hidden horizontally, vertically, or diagonally\n` +
                `4. Use \`.ws find <word>\` to mark a word as found\n` +
                `5. Find all words to win!`
            );
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const size = args.length > 1 ? parseInt(args[1]) : 10;
            if (isNaN(size) || size < 8 || size > 15) return await reply('❌ Size must be 8-15.');
            
            game = new WordSearch(size);
            // Add some words
            const wordList = ['DOG', 'CAT', 'BIRD', 'FISH', 'TREE', 'HOUSE', 'CAR', 'BOOK', 'PEN', 'SUN'];
            for (let w of wordList) {
                if (w.length <= size) game.addWord(w);
            }
            game.fillRemaining();
            games.set(gameKey, game);
            return await reply(game.getDisplayBoard());
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.ws start`');

        if (subCmd === 'find') {
            if (args.length < 2) return await reply('❌ Usage: `.ws find <word>`');
            const word = args.slice(1).join('').toUpperCase();
            const found = game.findWord(word);
            if (!found) return await reply('❌ Word not found or already found.');
            
            if (game.foundWords.length === game.words.length) {
                await reply(`🎉 *You found all words!* 🎉\n\n${game.getDisplayBoard()}`);
                games.delete(gameKey);
            } else {
                await reply(`✅ Found *${word}*!\n\n${game.getDisplayBoard()}`);
            }
            return;
        }

        await reply('❌ Unknown subcommand. Use `.ws guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading wordsearch.js:', e.message); }

/* ===== deline-games.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/**
 * deline-games.js
 * Game reply handler — checks global.games map for pending answers
 * Required by lib/messageHandler.js — REDXBOT302 v7
 */

/**
 * Called on every incoming message.
 * Returns true if the message was a game answer and was handled.
 */
async function handleGameReply(sock, message, chatId, userMessage) {
    try {
        if (!global.games || !global.games[chatId]) return false;

        const game = global.games[chatId];
        const guess = userMessage.trim().toLowerCase();

        // Only handle plain text guesses (not commands)
        if (!guess || guess.startsWith('.') || guess.startsWith('!')) return false;

        const channelInfo = {
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363408055942569@newsletter',
                    newsletterName: 'JUNAID-MD↣³⁰²',
                    serverMessageId: -1
                }
            }
        };

        const isCorrect = guess === game.answer;

        if (isCorrect) {
            delete global.games[chatId];
            await sock.sendMessage(chatId, {
                text: `✅ *Correct!*\n\nThe answer was: *${game.answer}*\n\n🎉 Well done!`,
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        // Wrong answer — give a hint or just say wrong
        await sock.sendMessage(chatId, {
            text: `❌ Wrong guess!\n\nHint: *${game.answer.charAt(0)}${'_'.repeat(Math.max(0, game.answer.length - 1))}*\n\n_Try again!_`,
            ...channelInfo
        }, { quoted: message });
        return true;
    } catch (err) {
        console.error('[deline-games] handleGameReply error:', err.message);
        return false;
    }
}

module.exports = { handleGameReply };

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading deline-games.js:', e.message); }

/* ===== deline-requests.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/**
 * deline-requests.js
 * Group join-request approve/reject helper
 * Required by approve.js — REDXBOT302 v7
 */

async function approveRequests(sock, chatId, message, args, context) {
    const { channelInfo } = context;
    try {
        const pending = await sock.groupRequestParticipantsList(chatId);
        if (!pending || pending.length === 0) {
            return sock.sendMessage(chatId, { text: '📭 No pending join requests.', ...channelInfo }, { quoted: message });
        }

        const target = args[0]?.toLowerCase();

        // .approve all
        if (target === 'all') {
            const jids = pending.map(p => p.jid);
            await sock.groupRequestParticipantsUpdate(chatId, jids, 'approve');
            return sock.sendMessage(chatId, {
                text: `✅ Approved *${jids.length}* pending request(s).`,
                ...channelInfo
            }, { quoted: message });
        }

        // .approve <number>
        const idx = parseInt(target) - 1;
        if (!isNaN(idx) && pending[idx]) {
            await sock.groupRequestParticipantsUpdate(chatId, [pending[idx].jid], 'approve');
            return sock.sendMessage(chatId, {
                text: `✅ Approved request from *${pending[idx].jid.split('@')[0]}*.`,
                ...channelInfo
            }, { quoted: message });
        }

        // No arg — list pending
        let list = `📋 *Pending Join Requests* (${pending.length})\n\n`;
        pending.forEach((p, i) => {
            list += `${i + 1}. +${p.jid.split('@')[0]}\n`;
        });
        list += `\n_Use .approve all OR .approve <number>_`;
        return sock.sendMessage(chatId, { text: list, ...channelInfo }, { quoted: message });
    } catch (err) {
        console.error('[deline-requests] approve error:', err.message);
        return sock.sendMessage(chatId, {
            text: `❌ Error: ${err.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

async function rejectRequests(sock, chatId, message, args, context) {
    const { channelInfo } = context;
    try {
        const pending = await sock.groupRequestParticipantsList(chatId);
        if (!pending || pending.length === 0) {
            return sock.sendMessage(chatId, { text: '📭 No pending join requests.', ...channelInfo }, { quoted: message });
        }

        const target = args[0]?.toLowerCase();

        if (target === 'all') {
            const jids = pending.map(p => p.jid);
            await sock.groupRequestParticipantsUpdate(chatId, jids, 'reject');
            return sock.sendMessage(chatId, {
                text: `🚫 Rejected *${jids.length}* pending request(s).`,
                ...channelInfo
            }, { quoted: message });
        }

        const idx = parseInt(target) - 1;
        if (!isNaN(idx) && pending[idx]) {
            await sock.groupRequestParticipantsUpdate(chatId, [pending[idx].jid], 'reject');
            return sock.sendMessage(chatId, {
                text: `🚫 Rejected request from *${pending[idx].jid.split('@')[0]}*.`,
                ...channelInfo
            }, { quoted: message });
        }

        let list = `📋 *Pending Join Requests* (${pending.length})\n\n`;
        pending.forEach((p, i) => { list += `${i + 1}. +${p.jid.split('@')[0]}\n`; });
        list += `\n_Use .reject all OR .reject <number>_`;
        return sock.sendMessage(chatId, { text: list, ...channelInfo }, { quoted: message });
    } catch (err) {
        console.error('[deline-requests] reject error:', err.message);
        return sock.sendMessage(chatId, { text: `❌ Error: ${err.message}`, ...channelInfo }, { quoted: message });
    }
}

module.exports = { approveRequests, rejectRequests };

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-09-games] Error loading deline-requests.js:', e.message); }

module.exports = _bundle;
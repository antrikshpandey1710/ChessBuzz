let game = null;
let board = null;

let difficulty = "easy";

const botSettings = {
    easy: {
        depth: 1,
        randomness: 0.70
    },

    medium: {
        depth: 2,
        randomness: 0.35
    },

    hard: {
        depth: 3,
        randomness: 0.12
    },

    advanced: {
        depth: 3,
        randomness: 0.03
    }
};


function startGame(level) {

    difficulty = level;

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    document.getElementById("difficultyText").textContent =
        level.charAt(0).toUpperCase() + level.slice(1);

    game = new Chess();

    createBoard();

    updateStatus();
}


function createBoard() {

    if (board) {
        board.destroy();
    }

    board = Chessboard("board", {

        draggable: true,

        position: "start",

        orientation: "white",

        onDragStart: function(source, piece) {

            if (!game) {
                return false;
            }

            if (game.game_over()) {
                return false;
            }

            if (game.turn() !== "w") {
                return false;
            }

            if (!piece || piece.charAt(0) !== "w") {
                return false;
            }

            return true;
        },


        onDrop: function(source, target) {

            const move = game.move({
                from: source,
                to: target,
                promotion: "q"
            });

            if (move === null) {
                return "snapback";
            }

            board.position(game.fen());

            updateStatus();

            if (!game.game_over()) {

                document.getElementById("status").textContent =
                    "Bot is thinking...";

                setTimeout(botMove, 250);
            }
        },


        onSnapEnd: function() {
            board.position(game.fen());
        }

    });
}


function botMove() {

    if (!game || game.game_over()) {
        updateStatus();
        return;
    }

    if (game.turn() !== "b") {
        return;
    }

    const moves = game.moves({
        verbose: true
    });

    if (moves.length === 0) {
        updateStatus();
        return;
    }

    const move = chooseBotMove();

    game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || "q"
    });

    board.position(game.fen());

    updateStatus();
}


function chooseBotMove() {

    const settings = botSettings[difficulty];

    const moves = game.moves({
        verbose: true
    });

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of moves) {

        game.move(move);

        let score = -minimax(
            game,
            settings.depth - 1,
            -Infinity,
            Infinity,
            false
        );

        game.undo();

        /*
         * Small randomness prevents the bot from choosing
         * exactly the same move in similar positions.
         */
        score +=
            (Math.random() - 0.5) *
            settings.randomness *
            100;

        if (score > bestScore) {

            bestScore = score;
            bestMoves = [move];

        } else if (
            Math.abs(score - bestScore) < 20
        ) {

            bestMoves.push(move);
        }
    }

    return bestMoves[
        Math.floor(Math.random() * bestMoves.length)
    ];
}


function minimax(
    position,
    depth,
    alpha,
    beta,
    maximizing
) {

    if (
        depth <= 0 ||
        position.game_over()
    ) {
        return evaluate(position);
    }

    const moves = position.moves({
        verbose: true
    });

    if (maximizing) {

        let best = -Infinity;

        for (const move of moves) {

            position.move(move);

            const score = minimax(
                position,
                depth - 1,
                alpha,
                beta,
                false
            );

            position.undo();

            best = Math.max(best, score);

            alpha = Math.max(alpha, score);

            if (beta <= alpha) {
                break;
            }
        }

        return best;

    } else {

        let best = Infinity;

        for (const move of moves) {

            position.move(move);

            const score = minimax(
                position,
                depth - 1,
                alpha,
                beta,
                true
            );

            position.undo();

            best = Math.min(best, score);

            beta = Math.min(beta, score);

            if (beta <= alpha) {
                break;
            }
        }

        return best;
    }
}


function evaluate(position) {

    if (position.in_checkmate()) {

        /*
         * If it is White's turn and White is checkmated,
         * Black has won.
         */
        if (position.turn() === "w") {
            return 100000;
        }

        return -100000;
    }

    if (position.in_draw()) {
        return 0;
    }


    const pieceValues = {
        p: 100,
        n: 320,
        b: 330,
        r: 500,
        q: 900,
        k: 20000
    };


    let score = 0;

    const boardState = position.board();

    for (const row of boardState) {

        for (const piece of row) {

            if (!piece) {
                continue;
            }

            const value =
                pieceValues[piece.type];

            if (piece.color === "b") {
                score += value;
            } else {
                score -= value;
            }
        }
    }

    return score;
}


function updateStatus() {

    if (!game) {
        return;
    }

    const status =
        document.getElementById("status");


    if (game.game_over()) {

        if (game.in_checkmate()) {

            if (game.turn() === "w") {

                status.textContent =
                    "Checkmate! Bot wins.";

            } else {

                status.textContent =
                    "Checkmate! You win!";
            }

        } else {

            status.textContent =
                "Draw!";
        }

        return;
    }


    if (game.in_check()) {

        if (game.turn() === "w") {

            status.textContent =
                "Check! Your turn.";

        } else {

            status.textContent =
                "Check! Bot's turn.";
        }

        return;
    }


    if (game.turn() === "w") {

        status.textContent =
            "Your turn";

    } else {

        status.textContent =
            "Bot's turn";
    }
}


function undoMove() {

    if (!game) {
        return;
    }

    if (game.history().length === 0) {
        return;
    }

    /*
     * Undo player's move + bot's previous move.
     */
    game.undo();

    if (game.history().length > 0) {
        game.undo();
    }

    board.position(game.fen());

    updateStatus();
}


function restartGame() {

    game = new Chess();

    board.position("start");

    document.getElementById("message").textContent = "";

    updateStatus();
}


function backToMenu() {

    if (board) {

        board.destroy();

        board = null;
    }

    game = null;

    document.getElementById("game").style.display = "none";

    document.getElementById("menu").style.display = "block";
}

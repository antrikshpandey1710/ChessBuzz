let game = null;
let difficulty = "easy";
let selectedSquare = null;

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

const pieces = {
    wp: "♙",
    wn: "♘",
    wb: "♗",
    wr: "♖",
    wq: "♕",
    wk: "♔",

    bp: "♟",
    bn: "♞",
    bb: "♝",
    br: "♜",
    bq: "♛",
    bk: "♚"
};


function startGame(level) {

    difficulty = level;

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    document.getElementById("difficultyText").textContent =
        level.charAt(0).toUpperCase() + level.slice(1);

    game = new Chess();

    selectedSquare = null;

    drawBoard();

    updateStatus();
}


function drawBoard() {

    const board = document.getElementById("board");

    board.innerHTML = "";

    board.style.display = "grid";
    board.style.gridTemplateColumns = "repeat(8, 1fr)";
    board.style.width = "100%";
    board.style.aspectRatio = "1 / 1";
    board.style.maxWidth = "500px";
    board.style.margin = "0 auto";
    board.style.borderRadius = "8px";
    board.style.overflow = "hidden";

    const position = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                String.fromCharCode(97 + col) + (8 - row);

            const piece = position[row][col];

            const cell = document.createElement("div");

            const isLight =
                (row + col) % 2 === 0;

            cell.style.width = "100%";
            cell.style.height = "100%";
            cell.style.display = "flex";
            cell.style.alignItems = "center";
            cell.style.justifyContent = "center";
            cell.style.fontSize = "clamp(30px, 10vw, 58px)";
            cell.style.cursor = "pointer";
            cell.style.userSelect = "none";

            cell.style.background =
                isLight ? "#f0d9b5" : "#b58863";

            if (selectedSquare === square) {
                cell.style.boxShadow =
                    "inset 0 0 0 5px #4CAF50";
            }

            if (piece) {

                const key =
                    piece.color + piece.type;

                cell.textContent =
                    pieces[key];

                cell.style.color =
                    piece.color === "w"
                        ? "#ffffff"
                        : "#111111";

                cell.style.textShadow =
                    piece.color === "w"
                        ? "0 2px 3px #333"
                        : "0 1px 2px #aaa";
            }

            cell.addEventListener(
                "click",
                () => handleSquareClick(square)
            );

            board.appendChild(cell);
        }
    }
}


function handleSquareClick(square) {

    if (!game || game.game_over()) {
        return;
    }

    if (game.turn() !== "w") {
        return;
    }

    const piece =
        game.get(square);


    if (!selectedSquare) {

        if (!piece || piece.color !== "w") {
            return;
        }

        selectedSquare = square;

        drawBoard();

        return;
    }


    if (selectedSquare === square) {

        selectedSquare = null;

        drawBoard();

        return;
    }


    const move = game.move({
        from: selectedSquare,
        to: square,
        promotion: "q"
    });


    if (move === null) {

        if (piece && piece.color === "w") {

            selectedSquare = square;

            drawBoard();

        } else {

            selectedSquare = null;

            drawBoard();
        }

        return;
    }


    selectedSquare = null;

    drawBoard();

    updateStatus();


    if (!game.game_over()) {

        document.getElementById("status").textContent =
            "Bot is thinking...";

        setTimeout(botMove, 300);
    }
}


function botMove() {

    if (!game || game.game_over()) {
        updateStatus();
        return;
    }

    if (game.turn() !== "b") {
        return;
    }

    const moves =
        game.moves({ verbose: true });

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

    drawBoard();

    updateStatus();
}


function chooseBotMove() {

    const settings =
        botSettings[difficulty];

    const moves =
        game.moves({ verbose: true });

    let bestScore = -Infinity;
    let bestMoves = [];


    for (const move of moves) {

        game.move(move);

        const score =
            -minimax(
                game,
                settings.depth - 1,
                -Infinity,
                Infinity,
                false
            );

        game.undo();


        const adjustedScore =
            score +
            (Math.random() - 0.5) *
            settings.randomness *
            100;


        if (adjustedScore > bestScore) {

            bestScore = adjustedScore;
            bestMoves = [move];

        } else if (
            Math.abs(adjustedScore - bestScore) < 20
        ) {

            bestMoves.push(move);
        }
    }


    return bestMoves[
        Math.floor(
            Math.random() * bestMoves.length
        )
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


    const moves =
        position.moves({ verbose: true });


    if (maximizing) {

        let best = -Infinity;


        for (const move of moves) {

            position.move(move);

            const score =
                minimax(
                    position,
                    depth - 1,
                    alpha,
                    beta,
                    false
                );

            position.undo();


            best =
                Math.max(best, score);

            alpha =
                Math.max(alpha, score);


            if (beta <= alpha) {
                break;
            }
        }

        return best;

    } else {

        let best = Infinity;


        for (const move of moves) {

            position.move(move);

            const score =
                minimax(
                    position,
                    depth - 1,
                    alpha,
                    beta,
                    true
                );

            position.undo();


            best =
                Math.min(best, score);

            beta =
                Math.min(beta, score);


            if (beta <= alpha) {
                break;
            }
        }

        return best;
    }
}


function evaluate(position) {

    if (position.in_checkmate()) {

        if (position.turn() === "w") {
            return 100000;
        }

        return -100000;
    }


    if (position.in_draw()) {
        return 0;
    }


    const values = {
        p: 100,
        n: 320,
        b: 330,
        r: 500,
        q: 900,
        k: 20000
    };


    let score = 0;

    const board =
        position.board();


    for (const row of board) {

        for (const piece of row) {

            if (!piece) {
                continue;
            }

            const value =
                values[piece.type];


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

            status.textContent =
                game.turn() === "w"
                    ? "Checkmate! Bot wins."
                    : "Checkmate! You win!";

        } else {

            status.textContent =
                "Draw!";
        }

        return;
    }


    if (game.in_check()) {

        status.textContent =
            game.turn() === "w"
                ? "Check! Your turn."
                : "Check! Bot's turn.";

        return;
    }


    status.textContent =
        game.turn() === "w"
            ? "Your turn"
            : "Bot's turn";
}


function undoMove() {

    if (!game) {
        return;
    }

    if (game.history().length === 0) {
        return;
    }


    game.undo();


    if (game.history().length > 0) {
        game.undo();
    }


    selectedSquare = null;

    drawBoard();

    updateStatus();
}


function restartGame() {

    game = new Chess();

    selectedSquare = null;

    drawBoard();

    updateStatus();
}


function backToMenu() {

    game = null;

    selectedSquare = null;

    document.getElementById("game").style.display =
        "none";

    document.getElementById("menu").style.display =
        "block";
                }

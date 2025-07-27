document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.game-board');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const width = 10;
    const height = 20;
    let score = 0;
    let timerId;
    let currentPosition;
    let currentRotation;
    let currentTetromino;
    let nextRandom = 0;

    // Create grid cells
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        gameBoard.appendChild(cell);
    }
    // Create a 'taken' marker div at the end
     for (let i = 0; i < width; i++) {
        const takenCell = document.createElement('div');
        takenCell.classList.add('taken');
        takenCell.style.display = 'none'; // Hide it
        gameBoard.appendChild(takenCell);
    }

    let squares = Array.from(gameBoard.querySelectorAll('div'));

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];
    
    const jTetromino = [
        [1, width + 1, width * 2 + 1, 0],
        [width, width + 1, width + 2, 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, 0, 1, 2]
    ];

    const sTetromino = [
        [width, width + 1, 1, 2],
        [0, width, width + 1, width * 2 + 1],
        [width, width + 1, 1, 2],
        [0, width, width + 1, width * 2 + 1]
    ];


    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, jTetromino, sTetromino];
    const tetrominoClasses = ['L', 'Z', 'T', 'O', 'I', 'J', 'S'];


    function draw() {
        currentTetromino[currentRotation].forEach(index => {
            squares[currentPosition + index].classList.add('tetromino', tetrominoClasses[nextRandom]);
        });
    }

    function undraw() {
        currentTetromino[currentRotation].forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino', tetrominoClasses[nextRandom]);
        });
    }

    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    function freeze() {
        if (currentTetromino[currentRotation].some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            currentTetromino[currentRotation].forEach(index => squares[currentPosition + index].classList.add('taken'));
            // Start a new tetromino falling
            selectNewTetromino();
        }
    }
    
    function selectNewTetromino() {
        currentRotation = 0;
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        currentTetromino = theTetrominoes[nextRandom];
        currentPosition = 4;
        draw();
        addScore();
        gameOver();
    }


    function moveLeft() {
        undraw();
        const isAtLeftEdge = currentTetromino[currentRotation].some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (currentTetromino[currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = currentTetromino[currentRotation].some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (currentTetromino[currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === currentTetromino.length) { // If the current rotation gets to 4, make it go back to 0
            currentRotation = 0;
        }
        // Check for collision after rotation, if so, rotate back.
        if (isCollision()) {
            currentRotation--;
             if (currentRotation === -1) {
                currentRotation = currentTetromino.length -1;
            }
        }
        draw();
    }
    
    function isCollision() {
         const isAtLeftEdge = currentTetromino[currentRotation].some(index => (currentPosition + index) % width === 0);
         const isAtRightEdge = currentTetromino[currentRotation].some(index => (currentPosition + index) % width === width - 1);
         
         if(isAtLeftEdge && isAtRightEdge) return false; //This is for the I tetromino which can occupy both edges at the same time.

         return currentTetromino[currentRotation].some(index => {
            const newPos = currentPosition + index;
            // Check if it's out of bounds horizontally
            const onLeftEdge = newPos % width === 0;
            const onRightEdge = newPos % width === width - 1;
            if (onLeftEdge && currentTetromino[currentRotation].some(i => (currentPosition + i) % width === width - 1)) return true;
            if (onRightEdge && currentTetromino[currentRotation].some(i => (currentPosition + i) % width === 0)) return true;
            // Check if it hits an already taken square
            return squares[newPos].classList.contains('taken');
        });
    }


    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken', 'tetromino');
                    squares[index].className = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => gameBoard.appendChild(cell));
            }
        }
    }

    function gameOver() {
        if (currentTetromino[currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'End';
            clearInterval(timerId);
            document.removeEventListener('keydown', control);
        }
    }

    function control(e) {
        if (timerId) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }
    }
    
    startButton.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            document.removeEventListener('keydown', control);
        } else {
            score = 0;
            scoreDisplay.innerHTML = score;
            // Clear board
            squares.forEach(cell => cell.className = '');
             for (let i = 200; i < 210; i++) {
                squares[i].classList.add('taken');
                squares[i].style.display = 'none';
            }

            selectNewTetromino();
            timerId = setInterval(moveDown, 1000);
            document.addEventListener('keydown', control);
        }
    });
});
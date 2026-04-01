let cells = document.querySelectorAll(".cell");
let resetBtn = document.querySelector("#reset-btn");
let turnO = true;
let newGameBtn = document.querySelector("#new-game-btn");
let messageContainer = document.querySelector(".msg-container");
let message = document.querySelector("#message");
let gameOver = false;
let animationId = null;
let winningCombo = null;
let isResizing = false;
let sessionId = 0; // Unique session ID for each game instance

// Canvas related variables
let canvas = document.querySelector("#line-canvas");
let ctx = canvas.getContext('2d');
let gameBoard = document.querySelector("#game-board");
let gameBoardWrapper = document.querySelector("#game-board-wrapper");
let winningLineDrawn = false;
let currentWinner = null;


const winningCombinations = [
    [0,1,2], [0,3,6], [0,4,8], [1,4,7],
    [2,5,8], [2,4,6], [3,4,5], [6,7,8],
];


    
cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        if (gameOver) return; // Prevent moves after game is over
        if (turnO) {
            cell.style.color = "blue";
            cell.innerText = "O";
            turnO = false;
        } else {
            cell.style.color = "red";
            cell.innerText = "X";
            turnO = true;
        }
        cell.disabled = true;
        let winnerExists = checkWinner();
        if (!winnerExists) {
            checkDraw();
        }
    });
});

const disableCells = () => {
    for (let cell of cells) {
        cell.disabled = true;
    }
};

const enableCells = () => {
    for (let cell of cells) {
        cell.disabled = false;
        cell.innerText = "";
    }
};

const resizeCanvas = () => {
    if (!gameBoardWrapper) return;
    const wrapperRect = gameBoardWrapper.getBoundingClientRect();
    canvas.width = wrapperRect.width;
    canvas.height = wrapperRect.height;
};

const getCellCenter = (index) => {
    const cell = cells[index];
    const wrapperRect = gameBoardWrapper.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    
    // Calculate center position relative to wrapper
    const centerX = cellRect.left - wrapperRect.left + cellRect.width / 2;
    const centerY = cellRect.top - wrapperRect.top + cellRect.height / 2;
    
    return { x: centerX, y: centerY };
};

// Perfect line positioning within cells
const getPerfectLinePoints = (startPos, endPos, combo) => {
    // Calculate direction vector
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Get cell size from first cell
    const cellRect = cells[0].getBoundingClientRect();
    const cellSize = cellRect.width;
    
    // Calculate how much to shorten based on cell size
    // We want the line to start and end at the edges of the cells
    // But still pass through the center
    
    // For horizontal/vertical lines, shorten by half cell width
    // For diagonals, shorten by a bit more to stay within corners
    
    let extendBy;
    
    // Check if it's a diagonal
    if (combo[0] === 0 && combo[2] === 8) { // Top-left to bottom-right
        extendBy = -cellSize * 0.2;  
    } else if (combo[0] === 2 && combo[2] === 6) { // Top-right to bottom-left
        extendBy = -cellSize * 0.2;
    } else {
        extendBy = -cellSize * 0.2;
    }
    
    // Calculate unit vector
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // Adjust start and end points
    const adjustedStart = {
        x: startPos.x + unitX * extendBy,
        y: startPos.y + unitY * extendBy
    };
    
    const adjustedEnd = {
        x: endPos.x - unitX * extendBy,
        y: endPos.y - unitY * extendBy
    };
    
    return { start: adjustedStart, end: adjustedEnd };
};

// Draw winning line
const drawWinningLine = (combination) => {
    if (!combination || winningLineDrawn) return;
    
    cancelAnimationFrame(animationId);
    animationId = null;

    winningLineDrawn = true;
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const startPos = getCellCenter(combination[0]);
    const endPos = getCellCenter(combination[2]);
    
    // Get perfectly positioned points
    const { start, end } = getPerfectLinePoints(startPos, endPos, combination);
    
    // Animation variables
    const animationSpeed = 0.03;
    let progress = 0;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate current end point for animation
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;
        if (isResizing) return;
        // Draw main line
        ctx.beginPath();
        ctx.strokeStyle = '#2b0000';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Draw inner white line
        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 0;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        if (progress < 1) {
            progress += animationSpeed;
            animationId = requestAnimationFrame(animate);
        }
    };
    animate();
};


const showWinner = (winner) => {
    gameOver = true;
    currentWinner = winner; // Store the winner
    disableCells();
    let currentSessionId = ++sessionId; // Increment session ID for this game instance
    // Then show the winner message after a tiny delay
    setTimeout(() => {
        if (sessionId !== currentSessionId) {
            return; 
        }
        if (!winner) {
            message.innerText = "It's a DRAW!";
        } else {
            message.innerText = `Player ${winner} wins!`;
        }
        messageContainer.classList.remove("hide");
        resetBtn.classList.add("hide");
        document.body.style.backgroundColor = "#AEB784"; 
    }, 1400); // Small delay of 1400ms
};


const resetGame = () => {
    sessionId++; // Increment session ID to invalidate any pending winner messages
    resetBtn.classList.remove("hide");
    document.body.style.backgroundColor = "#A94A4A";
    turnO = true;
    winningCombo = null;
    enableCells();
    messageContainer.classList.add("hide");
    currentWinner = null;
    winningLineDrawn = false;
    gameOver = false;
    cancelAnimationFrame(animationId);
    animationId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const checkWinner = () => {
    if (gameOver) return false;
    for (let combination of winningCombinations) {
        let pos1Val = cells[combination[0]].innerText; 
        let pos2Val = cells[combination[1]].innerText; 
        let pos3Val = cells[combination[2]].innerText;

        if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "") {
            if (pos1Val === pos2Val && pos2Val === pos3Val) {
                winningCombo = combination; // Store the winning combination
                drawWinningLine(combination);
                showWinner(pos1Val); // Show winner message
                return true;
            }
        }
    }  
    return false;
};

const checkDraw = () => {
    let allFilled = true;
    for (let cell of cells) {
        if (cell.innerText === "") {
            allFilled = false;
        }
    }
    if (allFilled) {
        showWinner(false);
    }
};

const drawWinningLineStatic = (combination) => {
    const startPos = getCellCenter(combination[0]);
    const endPos = getCellCenter(combination[2]);

    const { start, end } = getPerfectLinePoints(startPos, endPos, combination);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // outer line
    ctx.beginPath();
    ctx.strokeStyle = '#2b0000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // inner line
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
};

window.addEventListener('load', () => {
    resizeCanvas();
});

window.addEventListener('resize', () => {
    isResizing = true;
    resizeCanvas();

    if (winningLineDrawn && winningCombo) {
        drawWinningLineStatic(winningCombo);
    }
    isResizing = false;
});

resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);
let cells=document.querySelectorAll(".cell");
let resetBtn=document.querySelector("#reset-btn");
let turnO=true; // playerX, playerO
let newGameBtn=document.querySelector("#new-game-btn");
let messageContainer=document.querySelector(".msg-container");
let message=document.querySelector("#message");


const winningCombinations=[
    [0,1,2], 
    [0,3,6], 
    [0,4,8], 
    [1,4,7], 
    [2,5,8], 
    [2,4,6], 
    [3,4,5], 
    [6,7,8],
];

cells.forEach((cell)=>{
    cell.addEventListener("click",()=>{
        if (turnO){
            cell.innerText="O";
            turnO=false;
        } else {
            cell.innerText="X";
            turnO=true;
        }
        cell.disabled=true; // disable the cell after it's clicked
        checkWinner();
});
});

const disableCells=()=>{
    for (let cell of cells){
        cell.disabled=true;
    }               
};

const enableCells=()=>{
for (let cell of cells){
    cell.disabled=false;
    cell.innerText="";
}   
};
 
const showWinner=(winner)=>{
    message.innerText=`Congratulations! Winner is ${winner}`;
    messageContainer.classList.remove("hide");
    disableCells();
};

const resetGame = () => {
        turnO = true;
        enableCells();
        messageContainer.classList.add("hide");
};


const checkWinner=()=>{
    for (let combination of winningCombinations){
       let pos1Val=cells[combination[0]].innerText; 
       let pos2Val=cells[combination[1]].innerText; 
       let pos3Val=cells[combination[2]].innerText;

        if (pos1Val !== "" && pos2Val !== "" && pos3Val !== ""){
            if (pos1Val===pos2Val && pos2Val===pos3Val){
            showWinner(pos1Val);
}}
}};

resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);
    


let cell=document.querySelectorAll(".cell");
let resetButton=document.querySelector("#reset-button");
let turnO=true; // playerX, playerO

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

cell.forEach((cell)=>{
    cell.addEventListener("click",()=>{
        console.log("Cell clicked");
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

const checkWinner=()=>{
    for (let combination of winningCombinations){
       let pos1Val=cell[combination[0]].innerText; 
       let pos2Val=cell[combination[1]].innerText; 
       let pos3Val=cell[combination[2]].innerText;

        if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "" && pos1Val===pos2Val && pos2Val===pos3Val){
            console.log(`Winner: ${pos1Val}`);
}}}
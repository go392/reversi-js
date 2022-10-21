const  BOARD_SIZE=8;
const state ={
    turn:undefined,
    result:undefined,
    pass:undefined,
    num_white:undefined,
    num_black:undefined,
    black_is_npc:undefined,
    white_is_npc:undefined,
    start_menu:undefined,
    pause:false,
    reversibles:[],
    board:new Array(BOARD_SIZE),
    timeouts:{ 
        reversing:null,
        npc_thinking:null,
        auto_pass_click:null,    
    }
};

function bind_state(){
    state.turn = document.getElementById("turn");
    state.num_white = document.getElementById("white_state");
    state.num_black = document.getElementById("black_state");
    state.black_is_npc = document.getElementsByName("black_is_npc")[0];
    state.white_is_npc = document.getElementsByName("white_is_npc")[0];
    state.result = document.getElementById("result");
    state.start_menu = document.getElementById("start_menu");
    state.pass = document.getElementById("pass");
    const board = document.getElementById("board");
    for(let i=0; i<BOARD_SIZE; i++){
        let tr = document.createElement('tr');
        for(let j=0; j<BOARD_SIZE; j++){
            const td = document.createElement('td');
            tr.appendChild(td);
        }
        board.appendChild(tr);
    }
}

function init(){
    state.pause = false;
    state.result.style.display='none';
    state.result.style.opacity=0;
    state.num_white.innerText = 2;
    state.num_black.innerText = 2;
    state.start_menu.style.display='none';
    state.pass.style.display='none';
    const board = document.getElementById("board");
    for(let i=0; i<BOARD_SIZE; i++){
        state.board[i] = new Array(BOARD_SIZE)
        let tr = board.children[i]
        for(let j=0; j<BOARD_SIZE; j++){
            let td = tr.children[j];
            if(td.children.length != 0)td.removeChild(td.lastChild);
            const div = document.createElement('div');
            div.setAttribute('onclick', `boardClick( ${i}, ${j})`);
            td.appendChild(div);
            state.board[i][j] = div;
            state.board[i][j].className = "none";
        }
    }
    state.board[3][3].className = "white";
    state.board[3][4].className = "black";
    state.board[4][3].className = "black";
    state.board[4][4].className = "white";
    turnInit();
}
function _checkReversible( i, j, di, dj){
    let num = 0;
    let si= i, sj= j;
    if(state.board[si][sj].className != "none" && state.board[si][sj].className != "reversible") return 0;
    do{
        si += di;
        sj += dj;
        if(si >= BOARD_SIZE || si < 0) return 0;
        if(sj >= BOARD_SIZE || sj < 0) return 0;
        if(state.board[si][sj].className == "none") return 0;
        if(state.board[si][sj].className == "reversible") return 0;
        if(state.board[si][sj].className == state.turn.className) return num;
        num++;
    }while(true);
}
function _reverse_uncheck( i,j,di,dj){
    let si= i, sj= j;
    do{
        si += di;
        sj += dj;
        if(state.board[si][sj].className == state.turn.className)return;
        state.board[si][sj].className = state.turn.className;
        state.board[si][sj].style["animation-name"] = "reverse2" + state.turn.className;
    }while(true);
}
function _reverse(i, j, di, dj) {
    let ret;
    if (ret =_checkReversible(i, j, di, dj) != 0){
        _reverse_uncheck( i,j,di,dj);
    }
    return ret;
}
function _run8direction( i, j, func){
        const t = func( i, j, -1, 0);
        const b = func( i, j, 1, 0);
        const l = func( i, j, 0, -1);
        const r = func( i, j, 0, 1);
        const tl = func( i, j, -1, -1);
        const bl = func( i, j, 1, -1);
        const br = func( i, j, 1, 1);
        const tr = func( i, j, -1, 1);
        return t + b + l + r + tl + bl + br + tr;
    }
function reverse( i, j){ return _run8direction( i, j, _reverse); }
function checkReversible( i, j){ return _run8direction(i, j, _checkReversible);}
function showReversible(){
    state.reversibles=[];
    let ret =0;
    for(let i=0; i<BOARD_SIZE; i++){
        for(let j=0; j<BOARD_SIZE; j++){
            let c;
            if((c = checkReversible( i,j)) != 0){
                ret++;
                state.reversibles.push([[i, j], c]);
                state.board[i][j].className = "reversible";
            }else if(state.board[i][j].className == "reversible"){
                state.board[i][j].className = "none";
            }
        }
    }
    return ret;
}
function updateState() {
    let black =0, white =0;
    for(let i=0; i<BOARD_SIZE; i++){
        for(let j=0; j<BOARD_SIZE; j++){
            if(state.board[i][j].className == "black") black++;
            else if(state.board[i][j].className == "white") white++;
        }
    }
    state.num_white.innerText = white;
    state.num_black.innerText = black;
}
function boardClick(i, j){
    if(state[state.turn.className + "_is_npc"].checked) return;
    if(state.pause) return;
    if(state.is_reversing);
    if(state.board[i][j].className != "reversible" && state.board[i][j].className != "none" ) return;
    put(i, j);
}
function put(i, j){
    if(reverse( i,j) != 0){
        state.board[i][j].className = state.turn.className ;
        state.is_reversing=true;
        const delay = function(){
            turnChange();
            state.is_reversing=false;
        }
        updateState();
        state.timeouts.reversing = setTimeout(delay, 500);
    }
}
function turnInit(){
    state.turn.className ="";
    turnChange();
}
function _turnChange(){
    state.turn.className = state.turn.className == "black" ? "white" : "black";
    state.turn.style["animation-name"] = "reverse2" + state.turn.className;
}
function turnChange(){
    _turnChange();
    if(showReversible()== 0){
        _turnChange();
        if(showReversible() == 0){
            state.result.style.display= "block";
            state.result.style["animation-name"] = "fadein";
            const black = parseInt(state.num_black.innerText);
            const white = parseInt(state.num_white.innerText);
            state.result.children[1].children[0].className = white > black ? "white" : 
                (white < black ? "black" : "reversible");
            state.result.children[2].innerText = white == black ? "DRAW" : "WIN"
        }else {
            pass();
            if(state[(state.turn.className == "black" ? "white" : "black") + "_is_npc"].checked) {
                const delay= function(){
                    state.timeouts.auto_pass_click = null;
                    passClick();
                }
                state.timeouts.auto_pass_click = setTimeout(delay, 1000);
            }
        }
    }
    const wait = function(){
        if(state.pause){
            setTimeout(wait, 100);
        }else {
            if(state[state.turn.className + "_is_npc"].checked){
                npcThinking();
            }
        }
    }
    wait();
}
function npcThinking(){
    if(state.reversibles.length == 0) return;
    const delay= function(){
        for(let i=0; i<state.reversibles.length; i++){
            if(state.reversibles[i][0][0] == 0 ||
                state.reversibles[i][0][0] == BOARD_SIZE-1){
                if(state.reversibles[i][0][1] == 0 ||
                    state.reversibles[i][0][1] == BOARD_SIZE-1){
                        state.reversibles[i][1] *= 10;
                    }
            }
        }
        const res = state.reversibles.sort((a,b) =>{
            return a[1] < b[1] ? 1 : -1;
        })
        const max = res[0][1];
        const max_pat = [];
        for(let i=0; i<res.length; i++){
            if(max == res[i][1]) {
                max_pat.push(res[i][0]);
            }
        }
        const index = Math.floor(Math.random()* max_pat.length);
        put(max_pat[index][0], max_pat[index][1]);
        state.timeouts.npc_thinking= null;
    }
    state.timeouts.npc_thinking = setTimeout(delay, 250);
}
function pass(){
    state.pass.style.display = "block";
    state.pass.style["animation-name"] = "fadein";
    state.pause = true;
}
function passClick(){
    if(state.timeouts.auto_pass_click != null) return;
    state.pause= false;
    state.pass.style.display='none';
}
function reset(){
    state.pause = true;
    for(let i in state.timeouts){
        if(state.timeouts[i] != null){
            clearTimeout(state.timeouts[i]);
        }
    }
    state.start_menu.style.opacity=0;
    state.start_menu.style.display="block";
    state.start_menu.style["animation-name"] = "fadein";
    state.result.style.display="none";
}

window.onload = function(){
    bind_state();
}
const  BOARD_SIZE=8;

const reversi ={
    turn:undefined,
    result:undefined,
    pass:undefined,
    white:undefined,
    black:undefined,
    board:new Array(BOARD_SIZE),

    init: function(){
        const board = document.getElementById("board");
        this.turn = document.getElementsByClassName("turn")[0].children[0];
        this.turn.className = "black";
        this.white = document.getElementById("white_state");
        this.white.innerText = 2;
        this.black = document.getElementById("black_state");
        this.black.innerText = 2;
        this.result = document.getElementById("result");
        this.result.style.display='none';
        this.result.style.opacity=0;
        this.pass = document.getElementById("pass");
        for(let i=0; i<BOARD_SIZE; i++){
            this.board[i] = new Array(BOARD_SIZE)
            let tr = board.children[i]
            for(let j=0; j<BOARD_SIZE; j++){
                let td = tr.children[j];
                if(td.children.length != 0)td.removeChild(td.lastChild);
                const div = document.createElement('div');
                div.setAttribute('onclick', `reversi.boardClick(${i}, ${j})`);
                td.appendChild(div);
                this.board[i][j] = div;
                this.board[i][j].className = "none";
            }
        }
        this.board[3][3].className = "white";
        this.board[3][4].className = "black";
        this.board[4][3].className = "black";
        this.board[4][4].className = "white";
        this.showReversible();
    },
    _checkReversible(i, j, di, dj){
        let num = 0;
        let si= i, sj= j;
        if(this.board[si][sj].className != "none" && this.board[si][sj].className != "reversible") return 0;
        do{
            si += di;
            sj += dj;
            if(si >= BOARD_SIZE || si < 0) return 0;
            if(sj >= BOARD_SIZE || sj < 0) return 0;
            if(this.board[si][sj].className == "none") return 0;
            if(this.board[si][sj].className == "reversible") return 0;
            if(this.board[si][sj].className == this.turn.className) return num;
            num++;
        }while(true);
    },
    _reverse_uncheck(i,j,di,dj){
        let si= i, sj= j;
        do{
            si += di;
            sj += dj;
            if(this.board[si][sj].className == this.turn.className)return;
            this.board[si][sj].className = this.turn.className;
            this.board[si][sj].style["animation-name"] = "reverse2" + this.turn.className;
        }while(true);
    },
    _reverse(i, j, di, dj) {
        let ret;
        if (ret =this._checkReversible(i, j, di, dj) != 0){
            this._reverse_uncheck(i,j,di,dj);
        }
        return ret;
    },
    _run8direction(i, j, func){
        const t = this[func](i, j, -1, 0);
        const b = this[func](i, j, 1, 0);
        const l = this[func](i, j, 0, -1);
        const r = this[func](i, j, 0, 1);
        const tl = this[func](i, j, -1, -1);
        const bl = this[func](i, j, 1, -1);
        const br = this[func](i, j, 1, 1);
        const tr = this[func](i, j, -1, 1);
        return t + b + l + r + tl + bl + br + tr;
    },
    reverse(i, j){ return this._run8direction(i, j, "_reverse"); },
    checkReversible(i, j){ return this._run8direction(i, j, "_checkReversible") },
    showReversible(){
        let ret =0;
        for(let i=0; i<BOARD_SIZE; i++){
            for(let j=0; j<BOARD_SIZE; j++){
                if(this.checkReversible(i,j) != 0){
                    ret++;
                    this.board[i][j].className = "reversible";
                }else if(this.board[i][j].className == "reversible"){
                    this.board[i][j].className = "none";
                }
            }
        }
        return ret;
    },
    updateState: function() {
        let black =0, white =0;
        for(let i=0; i<BOARD_SIZE; i++){
            for(let j=0; j<BOARD_SIZE; j++){
                if(this.board[i][j].className == "black") black++;
                else if(this.board[i][j].className == "white") white++;
            }
        }
        this.white.innerText = white;
        this.black.innerText = black;
    },
    _turnChange:function(){
        this.turn.className = this.turn.className == "black" ? "white" : "black";
        this.turn.style["animation-name"] = "reverse2" + this.turn.className;
    },
    turnChange :function(){
        this._turnChange();
        if(this.showReversible()== 0){
            this._turnChange();
            if(this.showReversible() == 0){
                this.result.style.display= "block";
                this.result.style["animation-name"] = "fadein";
                const black = parseInt(state.num_black.innerText);
            	const white = parseInt(state.num_white.innerText);
            	state.result.children[1].className = white > black ? "white" : 
                	(white < black ? "black" : "reversible");
            	state.result.children[2].innerText = white == black ? "DRAW" : "WIN"
            }else {
                this.pass.style.display = "block";
                this.pass.style["animation-name"] = "fadein";
                this.pass.setAttribute("onclick", "reversi.pass.style.display='none';")
            }
        }
    },
    boardClick: function(i, j){
        if(this.board[i][j].className != "reversible" && this.board[i][j].className != "none" ) return;
        
        if(this.reverse(i,j) != 0){
            this.board[i][j].className = this.turn.className ;
            this.updateState();
            this.turnChange();
        }
    }
}

window.onload = function(){
    let board = document.getElementById("board");
    for(let i=0; i<BOARD_SIZE; i++){
        let tr = document.createElement('tr');
        for(let j=0; j<BOARD_SIZE; j++){
            const td = document.createElement('td');
            tr.appendChild(td);
        }
        board.appendChild(tr);
    }
    reversi.init();
}
import { Injectable } from '@nestjs/common';
let balence_coefficient: number = 1.1;
const INT_MIN = -(2 ** 31); 
const INT_MAX = 2 ** 31 - 1;
class chessBoard{
    private size: number;
    private board: Array<Array<number>>;
    private direction: number[][]=[
        [1,0],
		[0,1],
		[1,1],
		[1,-1]
    ];
    public current_player: number;
    constructor(s: number, cp: number){
        this.size = s;
        this.board = Array.from({ length: s }, () => Array(s).fill(0));
        this.current_player = cp;
    }
    checkBoundary(x: number, y: number): boolean{
        return (x<0||y<0||x>=this.size||y>=this.size)?false:true;
    }
    ifValid(x: number, y: number): boolean{
        return (this.board[x][y]==0)?true:false;
    }
    switchPlayer(): void{this.current_player *= -1;}
    placeAMove(x: number, y: number): boolean{
		if(!this.checkBoundary(x, y)){
			//cout<<endl<<"error: placeAMove, out of bound"<<endl;
			return false;
		}
		if(!this.ifValid(x, y)){
			//cout<<endl<<"error: placeAMove, chess piece already exists"<<endl;
			return false;
		}
		this.board[x][y] = this.current_player;
		return true;
	}
    checkStatus(x: number, y: number): number{
		if(!this.checkBoundary(x, y)){
			//cout<<endl<<"error: checkStatus, out of bound"<<endl;
			return 0;
		}
		if(this.board[x][y] != this.current_player){
			//cout<<endl<<"error: checkStatus, players don't match"<<endl;
			return 0;
		}
		for(let dir: number = 0; dir < 4; dir++){
			let count: number = 1;
			
			let dx: number = this.direction[dir][0];
			let dy: number = this.direction[dir][1];
			let i: number = x + dx,
                j: number = y + dy;
			while(this.checkBoundary(i,j) && this.board[i][j] == 
                this.current_player){
				i += dx;
				j += dy;
				count++;
			}
			i = x-dx;
			j = y-dy;
			while(this.checkBoundary(i,j) && this.board[i][j] == 
                this.current_player){
				i-=dx;
				j-=dy;
				count++;
			}
			if(count>=5){
				//this.printWinningMessage(this.current_player);
				return this.current_player;		//someone wins
			}
		}
		return 0;							//no one wins
	}
    //void clearScreen(){system("cls");}
	getBoard(): Array<Array<number>>{
		return this.board;
	}
	getSize(): number{
		return this.size;
	}
}

class Node{
	public current_score: number = 0;
	public board: Array<Array<number>>;
	public current_player: number;
	public size: number = 15;
	public direction: number[][] = [
		[1,0],
		[0,1],
		[1,1],
		[1,-1]
    ];
	checkBoundary(x: number, y: number): boolean{
        return (x < 0 || y < 0 || x >= this.size 
            || y >= this.size) ? false : true;
    }

	constructor(b: Array<Array<number>>, cp: number){
        this.current_player = cp;
        this.board = b.map(row => [...row]);
    }
    GameOver(cp: number): boolean{
		for(let p: number = 0; p < this.size; p++){
			for(let q: number = 0; q < this.size; q++){
				if(this.board[p][q]!=cp) continue;
				let x: number = p, y: number = q;
				for(let dir: number = 0; dir < 4; dir++){
					let count: number = 1;
					let dx: number = this.direction[dir][0];
					let dy: number = this.direction[dir][1];
					let i: number = x+dx, 
                        j: number = y+dy;
					while(this.checkBoundary(i,j) && this.board[i][j] == cp){
						i += dx;
						j += dy;
						count++;
					}
					i = x - dx;
					j = y - dy;
					while(this.checkBoundary(i,j) && this.board[i][j] == cp){
						i -= dx;
						j -= dy;
						count++;
					}
					if(count >= 5){
						return true;
					}
				}
			}
		}
		return false;
	}
	
	getValidMoves(): Array<[number, number]>{
		let moves: Array<[number, number]> = [];
		let candidate_moves: Set<[number, number]> = new Set();
		let candidate_moves_str: Set<String> = new Set();
		// Prioritize positions around existing pieces
		for(let i: number = 0; i < this.size;i++){
			for(let j: number = 0; j < this.size;j++){
				if(this.board[i][j]!=0){
					for(let di: number = -2; di <= 2; di++){
						for(let dj: number = -2; dj<=2; dj++){
							let ni: number = i + di, 
                                nj: number = j + dj;
							if(this.checkBoundary(ni,nj) && this.board[ni][nj]==0){
								candidate_moves_str.add(`${ni},${nj}`);
							}
						}
					}
				}
			}
		}
		
		// If no pieces exist, start from center
		if(candidate_moves_str.size === 0){
			candidate_moves_str.add
            (`${Math.floor(this.size/2)},${Math.floor(this.size/2)}`);
		}
		for(let can of candidate_moves_str){
            const [x, y] = can.split(",").map(Number);
            candidate_moves.add([x, y]);
        }
		for(let move of candidate_moves){
			moves.push(move);
		}
		return moves;
	}
	
	evaluateBoard(evaluate_player: number): number{
		if(this.GameOver(evaluate_player)){
			return 100000;
		}
		if(this.GameOver(-evaluate_player)){
			return -100000;
		}
		
		let enemy_player: number = evaluate_player * -1;
		let evaluate_player_score: number = 0;
		let enemy_player_score: number = 0;
		
		for(let i: number = 0; i < this.size; i++){
			for(let j: number = 0; j < this.size; j++){
				let cp: number = this.board[i][j];
				if(cp == 0) continue;
				
				for(let dir: number = 0; dir < 4; dir++){
					let dx: number = this.direction[dir][0];
					let dy: number = this.direction[dir][1];
					let prev_x: number = i-dx;
					let prev_y: number = j-dy;
					
					// Avoid recalculating the same line
					if(this.checkBoundary(prev_x,prev_y) && 
                        this.board[prev_x][prev_y]==cp){
						continue;
					}
	
					if(this.board[i][j]==evaluate_player){
						evaluate_player_score += this.isFiveInRow(i,j,dir);
						evaluate_player_score += this.isLiveFour(i,j,dir);
						evaluate_player_score += this.isThreatFour(i,j,dir);
						evaluate_player_score += this.isLiveThree(i,j,dir);
						evaluate_player_score += this.isThreatThree(i,j,dir);
						evaluate_player_score += this.isLiveTwo(i,j,dir);
						evaluate_player_score += this.isThreatTwo(i,j,dir);
					}else if(this.board[i][j]==enemy_player){
						enemy_player_score += this.isFiveInRow(i,j,dir);
						enemy_player_score += this.isLiveFour(i,j,dir);
						enemy_player_score += this.isThreatFour(i,j,dir);
						enemy_player_score += this.isLiveThree(i,j,dir);
						enemy_player_score += this.isThreatThree(i,j,dir);
						enemy_player_score += this.isLiveTwo(i,j,dir);
						enemy_player_score += this.isThreatTwo(i,j,dir);
					}
				}
			}
		}
		
		// Defense is more important than offense
		let total_score: number = evaluate_player_score - 
            enemy_player_score * balence_coefficient;
		this.current_score = total_score;
		return total_score;
	}	
	isFiveInRow(x: number, y: number, dir: number): number{
		let cp: number = this.board[x][y];
		let count: number = 1;
		let i: number = x + this.direction[dir][0];
		let j: number = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j]==cp){
			count++;
			i += this.direction[dir][0];
			j += this.direction[dir][1];
		}
		if(count>=5){
			return 100000;
		}
		return 0;
	}
	
	isLiveFour(x: number, y: number, dir: number): number{
		let i: number = x - this.direction[dir][0],
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j] !=0 ){
			return 0;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(count == 4 && this.checkBoundary(i,j) && this.board[i][j] == 0){
			return 50000;
		}
		return 0;
	}
	
	isThreatFour(x: number, y: number, dir: number): number{
		let front: boolean = false, 
            tail: boolean = false;
		let i: number = x - this.direction[dir][0], 
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j] == 0){
			front = true;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(this.checkBoundary(i,j) && this.board[i][j]==0){
			tail = true;
		}
		if(count == 4 && ((front && !tail) || (!front && tail))){
			return 10000;
		}
		return 0;
	}
	
	isLiveThree(x: number, y: number, dir: number): number{
		let i: number = x - this.direction[dir][0], 
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j] != 0){
			return 0;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(count==3 && this.checkBoundary(i,j) && this.board[i][j]==0){
			return 5000;
		}
		return 0;
	}
	
	isThreatThree(x: number, y: number, dir: number): number{
		let front: boolean = false, 
            tail: boolean = false;
		let i: number = x - this.direction[dir][0], 
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j]==0){
			front = true;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(this.checkBoundary(i,j) && this.board[i][j]==0){
			tail = true;
		}
		if(count == 3 && ((front && !tail) || (!front && tail))){
			return 1000;
		}
		return 0;
	}
	
	isLiveTwo(x: number, y: number, dir: number): number{
		let i: number = x - this.direction[dir][0], 
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j]!=0){
			return 0;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(count == 2 && this.checkBoundary(i,j) && this.board[i][j] == 0){
			return 500;
		}
		return 0;
	}
	
	isThreatTwo(x: number, y: number, dir: number): number{
		let front: boolean = false, 
            tail: boolean = false;
		let i: number = x - this.direction[dir][0], 
            j: number = y - this.direction[dir][1];
		if(this.checkBoundary(i,j) && this.board[i][j]==0){
			front = true;
		}
		let cp: number = this.board[x][y];
		let count: number = 1;
		i = x + this.direction[dir][0];
		j = y + this.direction[dir][1];
		while(this.checkBoundary(i,j) && this.board[i][j] == cp){
			i += this.direction[dir][0];
			j += this.direction[dir][1];
			count++;
		}
		if(this.checkBoundary(i,j) && this.board[i][j] == 0){
			tail = true;
		}
		if(count == 2 && ((front && !tail) || (!front && tail))){
			return 100;
		}
		return 0;
	}
}

// MinMax algorithm + Alpha-Beta pruning
function alphaBetaMinMax(node: Node, depth: number, alpha: number, beta: number, maximizing_player: boolean, ai_player: number): number{
	// Termination conditions
	if(depth==0 || node.GameOver(ai_player) || node.GameOver(-ai_player)){
		return node.evaluateBoard(ai_player);
	}
	
	let valid_moves: Array<[number, number]> = node.getValidMoves();
	
	if(maximizing_player){
		let max_eval: number = INT_MIN;
		for(let move of valid_moves){
			let x: number = move[0], 
                y: number = move[1];
			// Simulate move
			node.board[x][y] = node.current_player;
			let child_node = new Node(node.board, -node.current_player);
			
			let evaluate: number = alphaBetaMinMax(child_node, depth-1, alpha, beta, false, ai_player);
			
			// Undo move
			node.board[x][y] = 0;
			
			max_eval = Math.max(max_eval, evaluate);
			alpha = Math.max(alpha, evaluate);
			
			// Alpha-Beta pruning
			if(beta <= alpha){
				break;
			}
		}
		return max_eval;
	}else{
		let min_eval: number = INT_MAX;
		for(let move of valid_moves){
			let x = move[0], 
                y: number = move[1];
			// Simulate move
			node.board[x][y] = node.current_player;
			let child_node = new Node(node.board, -node.current_player);
			
			let evaluate: number = alphaBetaMinMax(child_node, depth-1, alpha, beta, true, ai_player);
			
			// Undo move
			node.board[x][y] = 0;
			
			min_eval = Math.min(min_eval, evaluate);
			beta = Math.min(beta, evaluate);
			
			// Alpha-Beta pruning
			if(beta <= alpha){
				break;
			}
		}
		return min_eval;
	}
}
function AIBestMove(board: Array<Array<number>>, current_player: number, search_depth: number): [number, number]{
	let node = new Node(board, current_player);
	let valid_moves: Array<[number, number]> = node.getValidMoves();
	
	let best_score: number = INT_MIN;
	let best_move: [number, number] = [-1, -1];
	
	//cout<<"AI is thinking..."<<endl;
	
	for(let move of valid_moves){
		let x: number = move[0], 
            y = move[1];
		// Simulate move
		node.board[x][y] = current_player;
		let child_node = new Node(node.board, -current_player);
		
		// Use MinMax algorithm with Alpha-Beta pruning
		let score = alphaBetaMinMax(child_node, search_depth-1, INT_MIN, INT_MAX, false, current_player);
		
		// Undo move
		node.board[x][y] = 0;
		
		if(score > best_score){
			best_score = score;
			best_move = move;
		}
	}
	//cout<<"AI best move score: "<<best_score<<endl;
	return best_move;
}

@Injectable()
export class GameService {
  private games: Map<string, [chessBoard, number]> = new Map(); 

  createGame(): string {
    const gameId = Math.random().toString(36).substring(2, 8);
    this.games.set(gameId, [new chessBoard(15, 1), 0]); // 15x15, black goes first, steps = 0
    return gameId;
  }

  handleMove(gameId: string, x: number, y: number) {
    const game = this.games.get(gameId);
    if (!game) return { error: 'Game not found' };

    if (!game[0].placeAMove(x, y)) {
      return { error: 'Invalid move' };
    }
    
    let status = game[0].checkStatus(x, y);
    if (status !== 0) {
      return { board: game[0].getBoard(), status, message: 'Player wins!' };
    }
    
    game[0].switchPlayer();
    game[1]++;

    if (game[0].current_player === -1) {
      let aiMove: [number, number];
      
      if (game[1] === 1) {
        let dx: number = Math.random() < 0.5 ? 1 : -1;
        let dy: number = Math.random() < 0.5 ? 1 : -1;
        while (x - dx < 0 || y - dy < 0 || x + dx > 14 || y + dy > 14) {
          dx = Math.random() < 0.5 ? 1 : -1;
          dy = Math.random() < 0.5 ? 1 : -1;
        }
        aiMove = [x + dx, y + dy];
      } else {
        aiMove = AIBestMove(game[0].getBoard(), game[0].current_player, 3);
      }
      
      if (aiMove[0] !== -1 && aiMove[1] !== -1) {
        if (!game[0].placeAMove(aiMove[0], aiMove[1])) {
          return { error: 'AI move invalid' };
        }
        
        status = game[0].checkStatus(aiMove[0], aiMove[1]);
        if (status !== 0) {
          return { board: game[0].getBoard(), status, message: 'AI wins!' };
        }
      }
      
      game[0].switchPlayer();
    }

    return { board: game[0].getBoard(), status: status || 0 };
  }
}
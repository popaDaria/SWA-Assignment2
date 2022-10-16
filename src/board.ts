export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}    

export type Match<T> = {
    matched: T,
    positions: Position[]
}    

export type Board<T> = {
    width: number,
    height: number,
    content: T[][]
};

export type Effect<T> = {
    kind: string,
    match?: Match<T>,
    board?: Board<T>
};

export type MoveResult<T> = {
    board: Board<T>,
    effects: Effect<T>[]
}    

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {

    let content: T[][] = []

    for(let i = 0; i<=height-1; i++){
        content[i] = [];
        for(let j = 0; j<=width-1; j++){
            content[i][j] = generator.next()
        }
    }

    const board: Board<T> = {
        width: width,
        height: height,
        content: content
    }
    return board;
}    

export function piece<T>(board: Board<T>, p: Position): T | undefined {
    const piece: T = board.content[p.row][p.col]
    return piece;
}    

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
    if(first.col===second.col || first.row===second.row){
        return true;
    }
    return false;
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
    if(canMove(board,first,second)){
        return {board: board, effects: []}
    }
    return {board: board, effects: []}
}

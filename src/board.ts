export type Generator<T> = { next: () => T }

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
    for (let i = 0; i <= height - 1; i++) {
        content[i] = [];
        for (let j = 0; j <= width - 1; j++) {
            content[i][j] = generator.next()
        }
    }
    const board: Board<T> = { width: width, height: height, content: content }
    return board;
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
    const piece: T = board.content[p.row] ? board.content[p.row][p.col] : undefined;
    return piece;
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
    if (piece(board, second) && piece(board, first)) {
        if (first.col === second.col || first.row === second.row) {
            const newBoard: Board<T> = JSON.parse(JSON.stringify(board)) as typeof board;
            newBoard.content[first.row][first.col] = piece(board, second);
            newBoard.content[second.row][second.col] = piece(board, first);
            if (checkMatches(newBoard, first.row, first.col)) {
                return true;
            }
            if (first.col === second.col) {
                if (checkMatches(newBoard, second.row, first.col)) {
                    return true;
                }
            } else {
                if (checkMatches(newBoard, first.row, second.col)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
    return false;
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
    if (canMove(board, first, second)) {
        const effects: Effect<T>[] = [];
        const newBoard: Board<T> = JSON.parse(JSON.stringify(board)) as typeof board;
        newBoard.content[first.row][first.col] = piece(board, second);
        newBoard.content[second.row][second.col] = piece(board, first);

        let matches: Match<T>[] = getMatches(newBoard, first.row, first.col);
        if (first.col === second.col) {
            matches.push(...getMatches(newBoard, second.row, first.col));
        } else {
            matches.push(...getMatches(newBoard, first.row, second.col));
        }
        matches.forEach(match => {
            effects.push({ kind: 'Match', match: match })
        });
        return { board: { ...newBoard }, effects: effects };
    }
    return { board: board, effects: [] }
}

function checkMatches<T>(board: Board<T>, row: number, col: number): boolean {
    let count = 0;
    for (let i = 0; i < board.width; i++) {
        if (board.content[row][i] === board.content[row][col]) {
            count++;
            if (count >= 3) {
                return true;
            }
        } else {
            count = 0;
        }
    }
    count = 0;
    for (let i = 0; i < board.height; i++) {
        if (board.content[i][col] === board.content[row][col]) {
            count++;
            if (count >= 3) {
                return true;
            }
        } else {
            count = 0;
        }
    }
    return false;
}

function getMatches<T>(board: Board<T>, row: number, col: number): Match<T>[] {
    const matches: Match<T>[] = [], match: Match<T> = { matched: board.content[row][col], positions: [] };
    for (let i = 0; i < board.width; i++) {
        board.content[row][i] === board.content[row][col] ? match.positions.push({ row: row, col: i })
            : match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    }
    match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    for (let i = 0; i < board.height; i++) {
        board.content[i][col] === board.content[row][col] ? match.positions.push({ row: i, col: col })
            : match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    }
    match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    return matches;
}
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
    return { width: width, height: height, content: content };
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
    return board.content[p.row] ? board.content[p.row][p.col] : undefined;
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
    if (piece(board, second) && piece(board, first)) {
        if (first.col === second.col || first.row === second.row) {
            const newBoard: Board<T> = JSON.parse(JSON.stringify(board)) as typeof board;
            newBoard.content[first.row][first.col] = piece(board, second);
            newBoard.content[second.row][second.col] = piece(board, first);
            if (getMatches(newBoard).length > 0) {
                return true;
            }
            return false;
        }
        return false;
    }
    return false;
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
    if (canMove(board, first, second)) {
        const newBoard: Board<T> = JSON.parse(JSON.stringify(board)) as typeof board;
        newBoard.content[first.row][first.col] = piece(board, second);
        newBoard.content[second.row][second.col] = piece(board, first);
        return { board: { ...newBoard }, effects: handleMatches(getMatches(newBoard), newBoard, generator, []) };
    }
    return { board: board, effects: [] };
}

function handleMatches<T>(matches: Match<T>[], newBoard: Board<T>, generator: Generator<T>, effects: Effect<T>[]) {
    matches.forEach(match => {
        effects.push({ kind: 'Match', match: match })
        match.positions.forEach(position => {
            newBoard.content[position.row][position.col] = null;
        });
    });
    for (let i: number = newBoard.height - 1; i >= 0; i--) {
        for (let j: number = 0; j < newBoard.width; j++) {
            if (!newBoard.content[i][j]) {
                for (let k: number = i; k > 0; k--) {
                    newBoard.content[i][j] = newBoard.content[k - 1][j];
                    newBoard.content[k - 1][j] = null;
                    if (newBoard.content[i][j])
                        break;
                }
            }
        }
    }
    for (let i = newBoard.height - 1; i >= 0; i--) {
        for (let j = 0; j < newBoard.width; j++) {
            if (!newBoard.content[i][j]) {
                newBoard.content[i][j] = generator.next();
            }
        }
    }
    effects.push({ kind: 'Refill', board: newBoard })
    if (getMatches(newBoard).length !== 0) {
        return handleMatches(getMatches(newBoard), newBoard, generator, effects);
    } else {
        return effects;
    }
}

function getMatches<T>(board: Board<T>): Match<T>[] {
    const matches: Match<T>[] = [], match: Match<T> = { matched: undefined, positions: [] };
    for (let i = 0; i < board.height; i++) {
        for (let j = 0; j < board.width - 1; j++) {
            if (board.content[i][j] === board.content[i][j + 1]) {
                if (match.positions.length > 0 ? (!(JSON.stringify(match.positions[match.positions.length - 1]) === JSON.stringify({ row: i, col: j }))) : true) {
                    match.positions.push({ row: i, col: j })
                }
                match.matched = board.content[i][j + 1];
                match.positions.push({ row: i, col: j + 1 })
            } else {
                match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
            }
        }
        match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    }
    for (let j = board.width - 1; j >= 0; j--) {
        for (let i = 0; i < board.height - 1; i++) {
            if (board.content[i][j] === board.content[i + 1][j]) {
                if (match.positions.length > 0 ? (!(JSON.stringify(match.positions[match.positions.length - 1]) === JSON.stringify({ row: i, col: j }))) : true) {
                    match.positions.push({ row: i, col: j })
                }
                match.matched = board.content[i + 1][j];
                match.positions.push({ row: i + 1, col: j })
            } else {
                match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
            }
        }
        match.positions.length < 3 ? match.positions = [] : (matches.push({ ...match }), match.positions = [])
    }
    return matches;
}
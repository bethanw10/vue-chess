import {Square} from "@/models/Square";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/moves/MoveType";

const _ = require('lodash');

export abstract class Piece {
    abstract readonly notation: string;
    colour: PieceColour;
    hasMoved: boolean = false;
    legalMoves: Map<Square, Move> = new Map<Square, Move>()

    protected constructor(colour: PieceColour) {
        this.colour = colour;
    }

    abstract imageSrc(): string

    abstract calculateLegalMoves(square: Square, board: Chessboard): Map<Square, Move>

    abstract symbol(): string

    static imageSrc(colour: PieceColour, pieceName: string) {
        return require(`@/assets/pieces/${colour.toString()}/${pieceName}.svg`);
    }

    updateLegalMoves(square: Square, board: Chessboard) {
        const moves = this.calculateLegalMoves(square, board);

        // Create a copy of the squares, then make possible move on copy
        // Check if move would put king in check using this copy
        const clonedSquares = _.cloneDeep(board.squares)

        for (const [square, move] of moves) {
            board.movePiece(clonedSquares, move);
            if (board.kingIsInCheck(clonedSquares, this.colour)) {
                moves.delete(square);
            }
        }

        this.legalMoves = moves;
    }

    setHasMoved(hasMoved: boolean) {
        this.hasMoved = hasMoved;
    }

    squareIsLegalMove(square: Square) {
        return this.legalMoves.has(square);
    }

    calculateMovesUnlimited(square: Square, directions: number[][], squares: Square[][]) {
        let dx, dy;
        const legalSquares = new Map<Square, Move>();
        for (const direction of directions) {
            [dx, dy] = direction;

            let x = square.rank + dx;
            let y = square.file + dy;

            while (this.isInBounds(x, y, squares)) {
                if (squares[x][y].getPiece()) {
                    if (this.canCapture(square, squares[x][y])) {
                        const move = new Move(square, squares[x][y], this, true, MoveType.Standard);
                        legalSquares.set(squares[x][y], move);
                    }

                    break;
                }

                const move = new Move(square, squares[x][y], this, false, MoveType.Standard);
                legalSquares.set(squares[x][y], move);
                x += dx;
                y += dy;
            }
        }
        return legalSquares;
    }

    calculateMovesLimited(square: Square, directions: number[][], squares: Square[][]) {
        const legalSquares = new Map<Square, Move>();
        for (const direction of directions) {
            const [dx, dy] = direction;

            const x = square.rank + dx;
            const y = square.file + dy;

            if (this.isInBounds(x, y, squares) && !this.isBlocked(square, squares[x][y])) {
                const move = new Move(square, squares[x][y], this, this.canCapture(square, squares[x][y]), MoveType.Standard);
                legalSquares.set(squares[x][y], move);
            }
        }
        return legalSquares;
    }

    protected isInBounds(rank: number, file: number, squares: Square[][]) {
        return rank >= 0 && rank < squares[0].length &&
            file >= 0 && file < squares.length;
    }

    protected canCapture(capturingSquare: Square, targetSquare: Square): boolean {
        return !!targetSquare &&
            !!targetSquare.getPiece()?.colour &&
            capturingSquare.getPiece()?.colour !== targetSquare.getPiece()?.colour;
    }

    protected isBlocked(square: Square, targetSquare: Square) {
        return targetSquare.getPiece()?.colour &&
            square.getPiece()?.colour === targetSquare.getPiece()?.colour;
    }
}
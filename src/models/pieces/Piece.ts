import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {Chessboard} from "@/models/Chessboard";
import {MoveType} from "@/models/moves/MoveType";
import {Square} from "@/models/Square";
import {MoveHistory} from "@/models/moves/MoveHistory";

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

    abstract calculateLegalMoves(square: Square, squares: Square[][], history: MoveHistory): Map<Square, Move>

    abstract symbol(): string

    static imageSrc(colour: PieceColour, pieceName: string) {
        return require(`@/assets/pieces/${colour.toString()}/${pieceName}.svg`);
    }

    updateLegalMoves(square: Square, board: Chessboard) {
        const moves = this.calculateLegalMoves(square, board.squares, board.moveHistory);

        // Create a copy of the squares, then make possible move on copy
        // Then check if king would be in check
        for (const [square, move] of moves) {
            if (this.moveWouldPutKingInCheck(board, move)) {
                moves.delete(square);
            }

            // Cannot castle if king would have to move through check
            if (move.type === MoveType.QueenSideCastle) {
                const kingMove = new Move(
                    move.fromSquare, board.squares[move.toSquare.rank][3],
                    move.piece, MoveType.Standard, false);

                if (this.moveWouldPutKingInCheck(board, kingMove)) {
                    moves.delete(square);
                }
            }

            if (move.type === MoveType.KingSideCastle) {
                const kingMove = new Move(
                    move.fromSquare, board.squares[move.toSquare.rank][5],
                    move.piece, MoveType.Standard, false);

                if (this.moveWouldPutKingInCheck(board, kingMove)) {
                    moves.delete(square);
                }
            }
        }


        this.legalMoves = moves;
        return moves;
    }

    moveWouldPutKingInCheck(board: Chessboard, move: Move) {
        const clonedSquares = _.cloneDeep(board.squares)
        board.movePiece(clonedSquares, move);
        return board.kingIsInCheck(clonedSquares, this.colour);
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
                        const move = new Move(
                            square, squares[x][y], this, MoveType.Standard,
                            true, squares[x][y].getPiece());

                        legalSquares.set(squares[x][y], move);
                    }

                    break;
                }

                const move = new Move(square, squares[x][y], this, MoveType.Standard, false);
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
                const isCapture = this.canCapture(square, squares[x][y]);
                const capturePiece = isCapture ? squares[x][y].getPiece() : null;

                const move = new Move(
                    square, squares[x][y], this, MoveType.Standard,
                    isCapture, capturePiece);

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
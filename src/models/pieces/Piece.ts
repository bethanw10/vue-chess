import {Square} from "@/models/Square";
import {PieceColour} from "@/models/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export abstract class Piece {
    abstract readonly notation: string;
    colour: PieceColour;
    hasMoved: boolean = false;

    protected constructor(colour: PieceColour) {
        this.colour = colour;
    }

    abstract imageSrc(): string

    abstract calculateLegalMoves(square: Square, board: Chessboard): void

    abstract symbol(): string

    static imageSrc(colour: PieceColour, pieceName: string) {
        return require(`@/assets/pieces/${colour.toString()}/${pieceName}.svg`);
    }

    setHasMoved(hasMoved: boolean) {
        this.hasMoved = hasMoved;
    }

    calculateMovesUnlimited(square: Square, directions: number[][], squares: Square[][]) {
        let dx, dy
        for (const direction of directions) {
            [dx, dy] = direction;

            let x = square.rank + dx;
            let y = square.file + dy;

            while (this.isInBounds(x, y, squares)) {
                if (squares[x][y].getPiece()) {
                    if (this.canCapture(square, squares[x][y])) {
                        squares[x][y].isLegal = true;
                    }

                    break;
                }

                squares[x][y].isLegal = true;
                x += dx;
                y += dy;
            }
        }
    }

    calculateMovesLimited(square: Square, directions: number[][], squares: Square[][]) {
        for (const direction of directions) {
            const [dx, dy] = direction;

            const x = square.rank + dx;
            const y = square.file + dy;

            if (this.isInBounds(x, y, squares) && !this.isBlocked(square, squares[x][y])) {
                squares[x][y].isLegal = true;
            }
        }
    }

    protected isInBounds(rank: number, file: number, squares: Square[][]) {
        return rank >= 0 && rank < squares[0].length &&
            file >= 0 && file < squares.length;
    }

    protected canCapture(capturingSquare: Square, targetSquare: Square) {
        return targetSquare &&
            targetSquare.getPiece()?.colour &&
            capturingSquare.getPiece()?.colour !== targetSquare.getPiece()?.colour;
    }

    protected isBlocked(square: Square, targetSquare: Square) {
        return targetSquare.getPiece()?.colour &&
            square.getPiece()?.colour === targetSquare.getPiece()?.colour;
    }
}
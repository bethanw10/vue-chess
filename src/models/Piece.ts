import {Square} from "@/models/Square";
import {PieceColour} from "@/models/Piece-Colour";

export abstract class Piece {
    colour: PieceColour;

    protected constructor(colour: PieceColour) {
        this.colour = colour;
    }

    abstract imageSrc(): string

    abstract calculateLegalMoves(square: Square, squares: Square[][]): void

    calculateMovesUnlimited(square: Square, directions: number[][], squares: Square[][]) {
        let dx, dy
        for (let direction of directions) {
            [dx, dy] = direction;

            let x = square.rank + dx;
            let y = square.file + dy;

            while (this.isInBounds(x, y, squares)) {
                if (squares[x][y].getPiece()) {
                    break;
                }
                squares[x][y].isLegal = true;
                x += dx;
                y += dy;
            }
        }
    }

    calculateMovesLimited(square: Square, directions: number[][], squares: Square[][]) {
        for (let direction of directions) {
            let [dx, dy] = direction;

            let x = square.rank + dx;
            let y = square.file + dy;

            if (this.isInBounds(x, y, squares) && !squares[x][y].getPiece()) {
                squares[x][y].isLegal = true;
            }
        }
    }

    protected isInBounds(rank: number, file: number, squares: Square[][]) {
        return rank >= 0 && rank < squares[0].length &&
            file >= 0 && file < squares.length;
    }
}
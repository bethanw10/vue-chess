import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class Pawn extends Piece {
    readonly notation: string = 'P';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`@/assets/pieces/${this.colour.toString()}/pawn.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        // White pawns move up the board and black pawns move down
        const dy = this.colour == PieceColour.WHITE ? 1 : -1;
        const startRank = this.colour == PieceColour.WHITE ? 1 : 6;

        const {rank, file} = square;
        if (rank === squares.length - 1) {
            return;
        }

        // todo en passant
        // todo promotion

        // Capturing
        if (this.canCapture(square, squares[rank + dy][file + 1])) {
            squares[rank + dy][file + 1].isLegal = true;
        }

        if (this.canCapture(square, squares[rank + dy][file - 1])) {
            squares[rank + dy][file - 1].isLegal = true;
        }

        // En passant
        const directions = [1, -1]

        for (const dx of directions) {
            if (this.canCapture(square, squares[rank][file + dx])) {
                const piece = squares[rank][file + dx].getPiece()
                if (piece?.moveHistory.length == 1) {
                    squares[rank + dy][file + dx].isLegal = true;
                }
            }
        }

        // Moving forward
        if (squares[rank + dy][file].getPiece()) {
            return;
        }

        squares[rank + dy][file].isLegal = true;

        if (rank === startRank && !squares[rank + (dy * 2)][file].getPiece()) {
            squares[rank + (dy * 2)][file].isLegal = true;
        }
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♟' : '♙';
    }
}

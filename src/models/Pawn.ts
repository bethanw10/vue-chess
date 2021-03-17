import {Square} from "@/models/Square";
import {Piece} from "@/models/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class Pawn extends Piece {
    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`../assets/pieces/${this.colour.toString()}/pawn.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        // White pawns move up the board and black pawns move down
        let dy = this.colour == PieceColour.WHITE ? 1 : -1;
        let startRank = this.colour == PieceColour.WHITE ? 1 : 6;

        if (square.rank === squares.length - 1) {
            return;
        }

        // todo en passant
        // todo capture diagonal

        if (squares[square.rank + dy][square.file].getPiece()) {
            return;
        }

        squares[square.rank + dy][square.file].isLegal = true;

        if (square.rank === startRank && !squares[square.rank + (dy * 2)][square.file].getPiece()) {
            squares[square.rank + (dy * 2)][square.file].isLegal = true;
        }
    }
}


import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {MoveHistory} from "@/models/moves/MoveHistory";

export class Bishop extends Piece {
    readonly notation: string = 'B';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "bishop");
    }

    calculateLegalMoves(square: Square, squares: Square[][], history: MoveHistory) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        return this.calculateMovesUnlimited(square, directions, squares);
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♝' : '♗';
    }
}


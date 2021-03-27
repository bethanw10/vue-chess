import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {MoveHistory} from "@/models/moves/MoveHistory";

export class Knight extends Piece {
    readonly notation: string = 'N';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "knight");
    }

    calculateLegalMoves(square: Square, squares: Square[][], history: MoveHistory) {
        const directions = [[2, 1], [2, -1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [1, -2], [-1, -2]];
        return this.calculateMovesLimited(square, directions, squares);
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♞' : '♘';
    }
}
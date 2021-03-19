import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class Knight extends Piece {
    readonly notation: string = 'N';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`@/assets/pieces/${this.colour.toString()}/knight.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        const directions = [[2, 1], [2, -1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [1, -2], [-1, -2]];
        this.calculateMovesLimited(square, directions, squares);
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♞' : '♘';
    }
}
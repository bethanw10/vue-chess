import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";

export class Rook extends Piece {
    readonly notation: string = 'R';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "rook");
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
        return this.calculateMovesUnlimited(square, directions, squares)
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♜' : '♖';
    }
}


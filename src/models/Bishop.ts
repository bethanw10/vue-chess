import {Square} from "@/models/Square";
import {Piece} from "@/models/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class Bishop extends Piece {
    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`../assets/pieces/${this.colour.toString()}/bishop.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.calculateMovesUnlimited(square, directions, squares)
    }
}


import {Square} from "@/models/Square";
import {Piece} from "@/models/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class King extends Piece {
    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`../assets/pieces/${this.colour.toString()}/king.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.calculateMovesLimited(square, directions, squares);

        // todo castling
    }
}
import {Square} from "@/models/Square";
import {Piece} from "@/models/Piece";
import {PieceColour} from "@/models/Piece-Colour";

export class Knight extends Piece {
    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`../assets/pieces/${this.colour.toString()}/knight.svg`)
    }

    calculateLegalMoves(square: Square, squares: Square[][]) {
        const directions = [[2, 1], [2, -1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [1, -2], [-1, -2]];
        this.calculateMovesLimited(square, directions, squares);
    }
}
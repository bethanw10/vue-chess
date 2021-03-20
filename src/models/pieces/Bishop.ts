import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Bishop extends Piece {
    readonly notation: string = 'B';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`@/assets/pieces/${this.colour.toString()}/bishop.svg`)
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.calculateMovesUnlimited(square, directions, board.squares)
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♝' : '♗';
    }
}


import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Queen extends Piece {
    readonly notation: string = 'Q';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`@/assets/pieces/${this.colour.toString()}/queen.svg`)
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.calculateMovesUnlimited(square, directions, board.squares)
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♛' : '♕';
    }
}
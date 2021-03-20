import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Rook extends Piece {
    readonly notation: string = 'R';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return require(`@/assets/pieces/${this.colour.toString()}/rook.svg`)
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
        this.calculateMovesUnlimited(square, directions, board.squares)
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♜' : '♖';
    }
}


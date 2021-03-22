import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Knight extends Piece {
    readonly notation: string = 'N';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "knight");
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[2, 1], [2, -1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [1, -2], [-1, -2]];
        this.calculateMovesLimited(square, directions, board.squares);
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♞' : '♘';
    }
}
import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Bishop extends Piece {
    readonly notation: string = 'B';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "bishop");
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.legalMoves = this.calculateMovesUnlimited(square, directions, board.squares);
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♝' : '♗';
    }
}


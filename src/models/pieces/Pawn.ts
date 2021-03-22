import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";

export class Pawn extends Piece {
    readonly notation: string = 'P';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "pawn");
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♟' : '♙';
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const squares = board.squares;
        const {rank, file} = square;

        // White pawns move up the board and black pawns move down
        const dy = this.colour == PieceColour.WHITE ? 1 : -1;
        const startRank = this.colour == PieceColour.WHITE ? 1 : 6;
        const promotionRank = this.colour == PieceColour.WHITE ? 7 : 0;

        if (rank === promotionRank) {
            return;
        }

        // Capturing
        if (this.canCapture(square, squares[rank + dy][file + 1])) {
            squares[rank + dy][file + 1].isLegal = true;
        }

        if (this.canCapture(square, squares[rank + dy][file - 1])) {
            squares[rank + dy][file - 1].isLegal = true;
        }

        // En passant
        const directions = [1, -1];

        for (const dx of directions) {
            if (this.canCapture(square, squares[rank][file + dx])) {
                const piece = squares[rank][file + dx].getPiece();
                if (this.lastMoveWasPawnTwoStep(piece, board)) {
                    squares[rank + dy][file + dx].isLegal = true;
                }
            }
        }

        // Moving forward
        if (squares[rank + dy][file].getPiece()) {
            return;
        }

        squares[rank + dy][file].isLegal = true;

        if (rank === startRank && !squares[rank + (dy * 2)][file].getPiece()) {
            squares[rank + (dy * 2)][file].isLegal = true;
        }
    }

    lastMoveWasPawnTwoStep(piece: Piece | null, board: Chessboard): boolean {
        const lastMove = board.moveHistory.lastMove();
        const isTwoSquareAdvance = Math.abs(lastMove.fromSquare.rank - lastMove.toSquare.rank) == 2;
        return piece instanceof Pawn && piece === lastMove?.piece && isTwoSquareAdvance;
    }
}


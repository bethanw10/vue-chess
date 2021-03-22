import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Rook} from "@/models/pieces/Rook";

export class King extends Piece {
    readonly notation: string = 'K';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "king");
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.calculateMovesLimited(square, directions, board.squares);

        // todo check
        // todo cannot castle when squares are under check

        // Castling
        if (!this.hasMoved) {

            // Kingside
            if (board.squares[square.rank][5].getPiece() == null &&
                board.squares[square.rank][6].getPiece() == null) {
                const rookSquarePiece = board.squares[square.rank][7].getPiece();

                if (rookSquarePiece instanceof Rook &&
                    !rookSquarePiece?.hasMoved) {
                    board.squares[square.rank][6].isLegal = true;
                }
            }

            // Queenside
            if (board.squares[square.rank][3].getPiece() == null &&
                board.squares[square.rank][2].getPiece() == null &&
                board.squares[square.rank][1].getPiece() == null
            ) {
                const rookSquarePiece = board.squares[square.rank][0].getPiece();

                if (rookSquarePiece instanceof Rook &&
                    !rookSquarePiece?.hasMoved) {
                    board.squares[square.rank][2].isLegal = true;
                }
            }
        }
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♚' : '♔';
    }
}
import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Rook} from "@/models/pieces/Rook";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/MoveType";

export class King extends Piece {
    readonly notation: string = 'K';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "king");
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        this.legalMoves = new Map<Square, Move>();

        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.legalMoves = this.calculateMovesLimited(square, directions, board.squares);

        // todo check
        for (const square of this.legalMoves) {
            //
        }

        // todo cannot castle when squares are under check

        // Castling
        if (!this.hasMoved) {
            // Kingside
            if (board.squares[square.rank][5].getPiece() == null &&
                board.squares[square.rank][6].getPiece() == null) {
                const rookSquarePiece = board.squares[square.rank][7].getPiece();

                if (rookSquarePiece instanceof Rook && !rookSquarePiece?.hasMoved) {
                    const move = new Move(
                        square, board.squares[square.rank][6], this,
                        false, MoveType.KingSideCastle);

                    this.legalMoves.set(board.squares[square.rank][6], move);
                }
            }

            // Queenside
            if (board.squares[square.rank][3].getPiece() == null &&
                board.squares[square.rank][2].getPiece() == null &&
                board.squares[square.rank][1].getPiece() == null) {
                const rookSquarePiece = board.squares[square.rank][0].getPiece();

                if (rookSquarePiece instanceof Rook && !rookSquarePiece?.hasMoved) {
                    const move = new Move(
                        square, board.squares[square.rank][2], this,
                        false, MoveType.QueenSideCastle);

                    this.legalMoves.set(board.squares[square.rank][2], move);
                }
            }
        }
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♚' : '♔';
    }
}
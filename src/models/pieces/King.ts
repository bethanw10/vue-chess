import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Rook} from "@/models/pieces/Rook";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/moves/MoveType";
import {MoveHistory} from "@/models/moves/MoveHistory";

export class King extends Piece {
    readonly notation: string = 'K';

    constructor(colour: PieceColour) {
        super(colour);
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "king");
    }

    calculateLegalMoves(square: Square, squares: Square[][], history: MoveHistory) {
        const directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        const legalMoves = this.calculateMovesLimited(square, directions, squares);

        if (this.hasMoved) {
            return legalMoves;
        }

        if (history.kingsideCanCastle[this.colour] && King.kingsideIsClear(squares, square)) {
            const rookSquarePiece = squares[square.rank][7].getPiece();

            if (King.rookCanCastle(rookSquarePiece)) {
                const move = new Move(square, squares[square.rank][6], this, MoveType.KingSideCastle);

                legalMoves.set(squares[square.rank][6], move);
            }
        }
        if (history.queensideCanCastle[this.colour] && King.queensideIsClear(squares, square)) {
            const rookSquarePiece = squares[square.rank][0].getPiece();

            if (King.rookCanCastle(rookSquarePiece)) {
                const move = new Move(square, squares[square.rank][2], this, MoveType.QueenSideCastle);

                legalMoves.set(squares[square.rank][2], move);
            }
        }

        return legalMoves;
    }

    private static rookCanCastle(rookSquarePiece: Piece | null) {
        return rookSquarePiece && rookSquarePiece instanceof Rook && !rookSquarePiece?.hasMoved;
    }

    private static kingsideIsClear(squares: Square[][], square: Square) {
        return squares[square.rank][5].getPiece() == null &&
            squares[square.rank][6].getPiece() == null;
    }

    private static queensideIsClear(squares: Square[][], square: Square) {
        return squares[square.rank][3].getPiece() == null &&
            squares[square.rank][2].getPiece() == null &&
            squares[square.rank][1].getPiece() == null;
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♚' : '♔';
    }
}
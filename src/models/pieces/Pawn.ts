import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/MoveType";

export class Pawn extends Piece {
    readonly notation: string = 'P';

    dy: number;
    startRank: number;
    promotionRank: number;

    constructor(colour: PieceColour) {
        super(colour);

        // White pawns move up the board and black pawns move down
        this.dy = this.colour == PieceColour.WHITE ? 1 : -1;
        this.startRank = this.colour == PieceColour.WHITE ? 1 : 6;
        this.promotionRank = this.colour == PieceColour.WHITE ? 7 : 0;
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "pawn");
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♟' : '♙';
    }

    calculateLegalMoves(square: Square, board: Chessboard) {
        this.legalMoves = new Map<Square, Move>();

        const squares = board.squares;
        const {rank, file} = square;

        if (rank === this.promotionRank) {
            return;
        }

        const leftAndRight = [1, -1];

        // Capturing
        for (const dx of leftAndRight) {
            const diagonalSquare = squares[rank + this.dy][file + dx];
            if (this.canCapture(square, diagonalSquare)) {
                const moveType = diagonalSquare.rank == this.promotionRank ? MoveType.Promotion : MoveType.Standard;
                const move = new Move(square, diagonalSquare, this, true, moveType);
                this.legalMoves.set(diagonalSquare, move);
            }
        }

        // En passant
        for (const dx of leftAndRight) {
            const adjacentSquare = squares[rank][file + dx];

            if (this.canCapture(square, adjacentSquare)) {
                const piece = adjacentSquare.getPiece();
                if (Pawn.lastMoveWasDoubleStep(piece, board)) {
                    const move = new Move(
                        square, squares[rank + this.dy][adjacentSquare.file], this,
                        true, MoveType.EnPassant);

                    this.legalMoves.set(squares[rank + this.dy][adjacentSquare.file], move);
                }
            }
        }

        // Moving forward
        const forwardSquare = squares[rank + this.dy][file];
        const moveType = forwardSquare.rank == this.promotionRank ? MoveType.Promotion : MoveType.Standard;
        if (forwardSquare.getPiece()) {
            return;
        }

        const move = new Move(square, forwardSquare, this, false, moveType);
        this.legalMoves.set(forwardSquare, move);

        if (rank !== this.promotionRank + this.dy) {
            const twoForwardSquare = squares[rank + (this.dy * 2)][file];
            if (rank === this.startRank && !twoForwardSquare.getPiece()) {
                const move = new Move(square, twoForwardSquare, this, false, MoveType.Standard);
                this.legalMoves.set(twoForwardSquare, move);
            }
        }
    }

    private static lastMoveWasDoubleStep(piece: Piece | null, board: Chessboard): boolean {
        const lastMove = board.moveHistory.lastMove();
        const isTwoSquareAdvance = Math.abs(lastMove.fromSquare.rank - lastMove.toSquare.rank) == 2;
        return piece instanceof Pawn && piece === lastMove?.piece && isTwoSquareAdvance;
    }
}


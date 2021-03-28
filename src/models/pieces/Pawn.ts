import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/moves/MoveType";
import {MoveHistory} from "@/models/moves/MoveHistory";

export class Pawn extends Piece {
    readonly notation: string = 'P';

    dy: number;
    startRank: number;
    promotionRank: number;

    constructor(colour: PieceColour) {
        super(colour);

        // White pawns move up the board and black pawns move down
        this.dy = this.colour == PieceColour.WHITE ? -1 : 1;
        this.startRank = this.colour == PieceColour.WHITE ? 6 : 1;
        this.promotionRank = this.colour == PieceColour.WHITE ? 0 : 7;
    }

    imageSrc(): string {
        return Piece.imageSrc(this.colour, "pawn");
    }

    symbol(): string {
        return this.colour === PieceColour.WHITE ? '♟' : '♙';
    }

    calculateLegalMoves(square: Square, squares: Square[][], history: MoveHistory) {
        const legalMoves = new Map<Square, Move>();
        const {rank, file} = square;

        if (rank === this.promotionRank) {
            return legalMoves;
        }

        const leftAndRight = [1, -1];

        // Capturing
        for (const dx of leftAndRight) {
            const diagonalSquare = squares[rank + this.dy][file + dx];
            if (this.canCapture(square, diagonalSquare)) {
                const moveType = diagonalSquare.rank == this.promotionRank ? MoveType.Promotion : MoveType.Standard;
                const move = new Move(square, diagonalSquare, this, moveType, true);
                legalMoves.set(diagonalSquare, move);
            }
        }

        // En passant
        for (const dx of leftAndRight) {
            const adjacentSquare = squares[rank][file + dx];

            if (this.canCapture(square, adjacentSquare)) {
                const piece = adjacentSquare.getPiece();
                const targetSquare = squares[rank + this.dy][adjacentSquare.file];

                if (history.enPassantTarget === targetSquare || Pawn.lastMoveWasDoubleStep(piece, history)) {
                    const move = new Move(
                        square, targetSquare, this,
                        MoveType.EnPassant, true);

                    legalMoves.set(targetSquare, move);
                }
            }
        }

        // Moving forward
        const forwardSquare = squares[rank + this.dy][file];
        const moveType = forwardSquare.rank == this.promotionRank ? MoveType.Promotion : MoveType.Standard;
        if (forwardSquare.getPiece()) {
            return legalMoves;
        }

        const move = new Move(square, forwardSquare, this, moveType, false);
        legalMoves.set(forwardSquare, move);

        if (this.isInBounds(rank + (this.dy * 2), file, squares)) {
            const twoForwardSquare = squares[rank + (this.dy * 2)][file];
            if (rank === this.startRank && !twoForwardSquare.getPiece()) {
                const move = new Move(square, twoForwardSquare, this, MoveType.Standard, false);
                legalMoves.set(twoForwardSquare, move);
            }
        }

        return legalMoves;
    }

    private static lastMoveWasDoubleStep(piece: Piece | null, history: MoveHistory): boolean {
        const lastMove = history.lastMove();
        if (!lastMove) {
            return false;
        }

        return lastMove?.piece === piece && lastMove.isPawnDoubleStep();
    }
}


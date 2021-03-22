import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Move, MoveType} from "@/models/Move";

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
        this.legalMoves = [];

        const squares = board.squares;
        const {rank, file} = square;

        if (rank === this.promotionRank) {
            return;
        }

        // Capturing
        if (this.canCapture(square, squares[rank + this.dy][file + 1])) {
            const move = new Move(square, squares[rank + this.dy][file + 1], this, true, MoveType.Standard);
            this.legalMoves.push(move);
        }

        if (this.canCapture(square, squares[rank + this.dy][file - 1])) {
            const move = new Move(square, squares[rank + this.dy][file - 1], this, true, MoveType.Standard);
            this.legalMoves.push(move);
        }

        // En passant
        const directions = [1, -1];
        for (const dx of directions) {
            const adjacentSquare = squares[rank][file + dx];

            if (this.canCapture(square, adjacentSquare)) {
                const piece = adjacentSquare.getPiece();
                if (Pawn.lastMoveWasDoubleStep(piece, board)) {
                    const move = new Move(
                        square, squares[rank + this.dy][adjacentSquare.file], this,
                        true, MoveType.EnPassant);

                    this.legalMoves.push(move);
                }
            }
        }

        // Moving forward
        const forwardSquare = squares[rank + this.dy][file];
        if (forwardSquare.getPiece()) {
            return;
        }

        const move = new Move(square, forwardSquare, this, false, MoveType.Standard);
        this.legalMoves.push(move);

        const twoForwardSquare = squares[rank + (this.dy * 2)][file];
        if (rank === this.startRank && !twoForwardSquare.getPiece()) {
            const move = new Move(square, twoForwardSquare, this, false, MoveType.Standard);
            this.legalMoves.push(move);
        }
    }

    private static lastMoveWasDoubleStep(piece: Piece | null, board: Chessboard): boolean {
        const lastMove = board.moveHistory.lastMove();
        const isTwoSquareAdvance = Math.abs(lastMove.fromSquare.rank - lastMove.toSquare.rank) == 2;
        return piece instanceof Pawn && piece === lastMove?.piece && isTwoSquareAdvance;
    }
}


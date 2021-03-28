// todo disambiguate after promotion??
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {MoveSet} from "@/models/moves/MoveSet";
import {Square} from "@/models/Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Piece} from "@/models/pieces/Piece";

export class MoveHistory {
    moves: MoveSet[] = []
    capturedPieces: Piece[] = [];

    halfTimeClock: number = 0;
    fullTimeClock: number = 0;

    // 'Overrides' based on FEN input
    queensideCanCastle = {[PieceColour.WHITE]: true, [PieceColour.BLACK]: true}
    kingsideCanCastle = {[PieceColour.WHITE]: true, [PieceColour.BLACK]: true}
    enPassantTarget: Square | null = null;

    constructor() {
    }

    recordMove(move: Move) {
        if (move.capture || move.piece instanceof Pawn) {
            this.halfTimeClock = 0;
        } else {
            this.halfTimeClock++;
        }

        if (move.piece?.colour === PieceColour.WHITE) {
            this.moves.push(new MoveSet(move));
        } else {
            if (this.moves.length === 0) {
                this.moves.push(new MoveSet());
            }

            this.moves[this.moves.length - 1].recordBlackMove(move);
            this.fullTimeClock++;
        }

        if (move.capturedPiece) {
            this.capturedPieces.push(move.capturedPiece);
        }

        this.enPassantTarget = null;
    }

    lastMove(): Move | null {
        if (this.moves.length === 0) {
            return null;
        }

        const lastMoveSet = this.moves[this.moves.length - 1];
        return lastMoveSet.blackMove ?? lastMoveSet.whiteMove;
    }

    recordCheck() {
        const move = this.lastMove()
        if (move) {
            move.check = true;
        }
    }

    recordCheckmate() {
        const move = this.lastMove()
        if (move) {
            move.checkmate = true;
        }
    }

    setCastlingOverrides(castling: string) {
        if (!castling.includes('K')) {
            this.kingsideCanCastle[PieceColour.WHITE] = false;
        }
        if (!castling.includes('k')) {
            this.kingsideCanCastle[PieceColour.BLACK] = false;
        }
        if (!castling.includes('Q')) {
            this.queensideCanCastle[PieceColour.WHITE] = false;
        }
        if (!castling.includes('q')) {
            this.queensideCanCastle[PieceColour.BLACK] = false;
        }
    }

    setEnPassantSquare(square: Square) {
        this.enPassantTarget = square;
    }
}
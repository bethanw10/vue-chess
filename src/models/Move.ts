import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";
import {Square} from "@/models/Square";
import {Pawn} from "@/models/pieces/Pawn";

// todo disambiguate after promotion??
export class MoveHistory {
    moves: MoveSet[] = []

    constructor() {
    }

    recordMove(
        fromSquare: Square,
        toSquare: Square,
        piece: Piece | null,
        capture: boolean,
        moveType: MoveType = MoveType.Standard) {
        const move = new Move(fromSquare, toSquare, piece, capture, moveType);

        if (fromSquare.getPiece()?.colour === PieceColour.WHITE) {
            this.moves.push(new MoveSet(move));
        } else {
            if (this.moves.length === 0) {
                this.moves.push(new MoveSet());
            }

            this.moves[this.moves.length - 1].recordBlackMove(move);
        }
    }

    lastMove(): Move {
        const lastMoveSet = this.moves[this.moves.length - 1];
        return <Move>lastMoveSet.blackMove ?? lastMoveSet.whiteMove;
    }
}

export class MoveSet {
    whiteMove: Move | null = null;
    blackMove: Move | null = null;

    constructor(whiteMove: Move | null = null) {
        this.whiteMove = whiteMove
    }

    recordBlackMove(move: Move) {
        this.blackMove = move
    }
}

export class Move {
    fromSquare: Square;
    toSquare: Square;
    piece: Piece | null;
    capture: boolean;
    moveType: MoveType;

    constructor(
        fromSquare: Square,
        toSquare: Square,
        piece: Piece | null,
        capture: boolean,
        moveType: MoveType) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.piece = piece;
        this.capture = capture;
        this.moveType = moveType;
    }

    toString() {
        if (this.moveType === MoveType.KingSideCastle) {
            return this.piece?.symbol() + ' O-O';
        } else if (this.moveType === MoveType.QueenSideCastle) {
            return this.piece?.symbol() + ' O-O-O';
        }

        let move = this.toSquare.notation();

        if (this.capture) {
            move = 'x' + move

            if (this.piece instanceof Pawn) {
                move = this.fromSquare.fileLetter() + move;
            }

            if (this.moveType === MoveType.EnPassant) {
                move = `${move} e.p.`;
            }
        }

        if (this.moveType === MoveType.Promotion) {
            move = `${move}=${this.piece?.notation}`;
        } else if (!(this.piece instanceof Pawn)) {
            move = this.piece?.notation + move;
        }

        return `${this.piece?.symbol()} ${move}`;
    }
}

export enum MoveType {
    Standard,
    EnPassant,
    QueenSideCastle,
    KingSideCastle,
    Promotion
}
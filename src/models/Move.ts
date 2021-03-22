import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Square} from "@/models/Square";
import {Pawn} from "@/models/pieces/Pawn";
import {MoveType} from "@/models/MoveType";

// todo disambiguate after promotion??
export class MoveHistory {
    moves: MoveSet[] = []

    constructor() {
    }

    recordMove(move: Move) {
        if (move.piece?.colour === PieceColour.WHITE) {
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
    type: MoveType;

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
        this.type = moveType;
    }

    toString() {
        if (this.type === MoveType.KingSideCastle) {
            return this.piece?.symbol() + ' O-O';
        } else if (this.type === MoveType.QueenSideCastle) {
            return this.piece?.symbol() + ' O-O-O';
        }

        let move = this.toSquare.notation();

        if (this.capture) {
            move = 'x' + move

            if (this.piece instanceof Pawn) {
                move = this.fromSquare.fileLetter() + move;
            }

            if (this.type === MoveType.EnPassant) {
                move = `${move} e.p.`;
            }
        }

        if (this.type === MoveType.Promotion) {
            move = `${move}=${this.piece?.notation}`;
        } else if (!(this.piece instanceof Pawn)) {
            move = this.piece?.notation + move;
        }

        return `${this.piece?.symbol()} ${move}`;
    }
}


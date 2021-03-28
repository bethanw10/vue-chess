import {MoveType} from "@/models/moves/MoveType";
import {Square} from "@/models/Square";
import {Piece} from "@/models/pieces/Piece";
import {Pawn} from "@/models/pieces/Pawn";

export class Move {
    fromSquare: Square;
    toSquare: Square;
    piece: Piece | null;
    type: MoveType;
    capture: boolean;
    check: boolean = false;
    checkmate: boolean = false;

    constructor(
        fromSquare: Square,
        toSquare: Square,
        piece: Piece | null,
        moveType: MoveType,
        capture: boolean) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.piece = piece;
        this.capture = capture;
        this.type = moveType;
    }

    isPawnDoubleStep() {
        return this.piece instanceof Pawn && Math.abs(this.fromSquare.rank - this.toSquare.rank) == 2;
    }

    toString() {
        let move: string;
        switch (this.type) {
            case MoveType.KingSideCastle:
                move = 'O-O';
                break;
            case MoveType.QueenSideCastle:
                move = 'O-O-O';
                break;
            case MoveType.Promotion:
                move = `${this.toSquare.notation()}=${this.piece?.notation}`;
                break;
            default:
                move = this.toSquare.notation();
                break;
        }

        if (this.capture) {
            move = `x${move}`

            if (this.piece instanceof Pawn || this.type === MoveType.Promotion) {
                move = this.fromSquare.fileLetter() + move;
            }

            if (this.type === MoveType.EnPassant) {
                move = `${move} e.p.`;
            }
        }

        if (this.type === MoveType.Standard && !(this.piece instanceof Pawn)) {
            move = this.piece?.notation + move;
        }

        if (this.checkmate) {
            move = move + '#';
        } else if (this.check) {
            move = move + '+';
        }

        return `${this.piece?.symbol()} ${move}`;
    }
}


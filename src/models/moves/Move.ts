import {Piece} from "@/models/pieces/Piece";
import {Square} from "@/models/Square";
import {Pawn} from "@/models/pieces/Pawn";
import {MoveType} from "@/models/MoveType";

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
        switch (this.type) {
            case MoveType.KingSideCastle:
                return this.piece?.symbol() + ' O-O';
            case MoveType.QueenSideCastle:
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


// todo disambiguate after promotion??
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {MoveSet} from "@/models/moves/MoveSet";

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
}
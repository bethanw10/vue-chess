import {Move} from "@/models/moves/Move";

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
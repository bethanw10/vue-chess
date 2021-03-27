import {Piece} from "@/models/pieces/Piece";

export class Square {
    _piece: Piece | null;
    rank: number;
    file: number;

    LOWERCASE_CHAR_OFFSET = 97;

    constructor(rank: number, file: number, piece: Piece | null = null) {
        this.rank = rank;
        this.file = file;
        this._piece = piece
    }

    notation() {
        return `${this.fileLetter()}${this.rank + 1}`
    }

    fileLetter() {
        return String.fromCharCode(this.file + this.LOWERCASE_CHAR_OFFSET);
    }

    setPiece(piece: Piece | null) {
        this._piece = piece;
    }

    removePiece() {
        const removedPiece = this._piece;
        this._piece = null;
        return removedPiece;
    }

    getPiece() {
        return this._piece;
    }

    getMove(toSquare: Square) {
        return this._piece?.legalMoves.get(toSquare);
    }
}
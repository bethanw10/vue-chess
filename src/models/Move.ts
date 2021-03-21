import {Piece} from "@/models/pieces/Piece";
import {PieceColour} from "@/models/Piece-Colour";
import {Square} from "@/models/Square";
import {Pawn} from "@/models/pieces/Pawn";

export class MoveHistory {
    moves: MoveSet[] = []

    constructor() {
    }

    recordMove(fromSquare: Square, toSquare: Square, capture: boolean) {
        const move = new Move(fromSquare, toSquare, fromSquare.getPiece(), capture);

        if (fromSquare.getPiece()?.colour === PieceColour.WHITE) {
            this.moves.push(new MoveSet(move));
        } else {
            if (this.moves.length === 0) {
                this.moves.push(new MoveSet());
            }

            this.moves[this.moves.length - 1].recordBlackMove(move);
        }
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
    enPassant: boolean;
    castle: boolean;

    constructor(
        fromSquare: Square,
        toSquare: Square,
        piece: Piece | null,
        capture: boolean = false,
        enPassant: boolean = false,
        castle: boolean = false) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.piece = piece;
        this.capture = capture;
        this.enPassant = enPassant;
        this.castle = castle;
    }

    toString() {
        let move = this.toSquare.notation();

        if (this.capture) {
            move = 'x' + move

            if (this.piece instanceof Pawn) {
                move = this.fromSquare.fileLetter() + move;
            }
        }

        if (!(this.piece instanceof Pawn)) {
            move = this.piece?.notation + move;
        }

        return this.piece?.symbol() + move;
    }
}

export enum MoveType {
    Standard,
    EnPassant,
    QueenSideCastle,
    KingSideCastle
}
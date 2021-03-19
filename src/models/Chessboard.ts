import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/Piece-Colour";

export class Chessboard {
    squares: Square[][] = [];
    ranks: number = 0;
    files: number = 0;
    moves: string[][] = [];
    fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    activeColor: PieceColour = PieceColour.WHITE

    constructor(ranks: number, files: number) {
        this.ranks = ranks;
        this.files = files;
        //this.fen = '4k3/8/8/8/8/8/4P3/4K3 b - - 5 39';

        this.init(this.fen);
    }

    init(fen: string) {
        this.squares = this.createEmptyBoard();

        const data = fen.split(' ');
        const rows = data[0].split('/');
        const active = data[1];
        this.activeColor = active === 'w' ? PieceColour.WHITE : PieceColour.BLACK;

        let rank = 0;
        let file = 0;

        for (const row of rows) {
            for (const character of row) {
                if (this.isLetter(character)) {
                    const piece = this.createPieceFromChar(character);

                    if (piece) {
                        this.squares[rank][file].setPiece(piece);
                    }

                    file += 1;
                } else {
                    const emptySpaces = +character;
                    file += emptySpaces
                }
            }

            file = 0
            rank += 1;
        }
    }

    createEmptyBoard() {
        const arr: Square[][] = [];
        for (let file = 0; file < this.files; file++) {
            if (!arr[file]) {
                arr[file] = [];
            }
            for (let rank = 0; rank < this.ranks; rank++) {
                arr[file][rank] = new Square(file, rank);
            }
        }
        return arr;
    }

    createPieceFromChar(char: string) {
        switch (char.toUpperCase()) {
            case 'R':
                return new Rook(this.getPieceColor(char))

            case 'N':
                return new Knight(this.getPieceColor(char))

            case 'B':
                return new Bishop(this.getPieceColor(char))

            case 'Q':
                return new Queen(this.getPieceColor(char))

            case 'K':
                return new King(this.getPieceColor(char))

            case 'P':
                return new Pawn(this.getPieceColor(char))

            default:
                throw Error('Unrecognised character in FEN ' + char);
        }
    }

    getPieceColor = (pieceChar: string) => {
        return /^[A-Z]*$/.test(pieceChar) ? PieceColour.BLACK : PieceColour.WHITE;
    }

    isLetter = (string: string) => /[a-zA-Z]/.test(string)

    calculateLegalMoves(square: Square) {
        square.getPiece()?.calculateLegalMoves(square, this.squares);
    }

    clearLegalMoves() {
        for (const file of this.squares) {
            for (const square of file) {
                square.isLegal = false;
            }
        }
    }

    // make move class?
    recordMove(fromSquare: Square, toSquare: Square, capturingMove: boolean) {
        let move = toSquare.notation();

        if (capturingMove) {
            move = 'x' + move

            if (fromSquare.getPiece() instanceof Pawn &&
                fromSquare.getPiece()?.moveHistory.length != 0) {
                move = fromSquare.fileLetter() + move;
            }
        }

        if (!(fromSquare.getPiece() instanceof Pawn)) {
            move = fromSquare.getPiece()?.notation + move;
        }

        move = fromSquare.getPiece()?.symbol() + '\t' + move;

        fromSquare.getPiece()?.recordMove(move);

        if (this.activeColor === PieceColour.WHITE) {
            this.moves.push([move]);
        } else {
            if (this.moves.length === 0) {
                this.moves.push([]);
            }

            this.moves[this.moves.length - 1].push(move);
        }
    }

    // pivot to pieces recalculating legal moves after every move?
    // then show legal moves based on currentSquare
    // and unset currentSquare instead of clearLegalSquares
    move(fromSquare: Square, toSquare: Square) {
        let capturingMove = toSquare.getPiece() !== null;

        // en passant
        if (fromSquare.getPiece() instanceof Pawn &&
            toSquare.file !== fromSquare.file &&
            this.squares[fromSquare.rank][toSquare.file].getPiece() instanceof Pawn) {
            this.squares[fromSquare.rank][toSquare.file].removePiece()
            capturingMove = true;
        }

        this.recordMove(fromSquare, toSquare, capturingMove);
        const piece = fromSquare.removePiece();
        toSquare.setPiece(piece);

        this.activeColor = this.activeColor ===
        PieceColour.WHITE ? PieceColour.BLACK : PieceColour.WHITE;
    }
}

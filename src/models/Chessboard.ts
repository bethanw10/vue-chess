import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/Piece-Colour";
import {MoveHistory} from "@/models/Move";

export class Chessboard {
    squares: Square[][] = [];
    ranks: number = 8;
    files: number = 8;
    moves: string[][] = [];
    movesAlt: MoveHistory = new MoveHistory;

    fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    activeColor: PieceColour = PieceColour.WHITE

    constructor() {
        //this.fen = '4k3/8/8/8/8/8/4P3/4K3 b - - 5 39';

        this.init();
    }

    init() {
        this.squares = this.createEmptyBoard();

        const data = this.fen.split(' ');
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

    reset() {
        this.moves = [];
        this.init();
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
        square.getPiece()?.calculateLegalMoves(square, this);
    }

    clearLegalMoves() {
        for (const file of this.squares) {
            for (const square of file) {
                square.isLegal = false;
            }
        }
    }

    // make move class?
    // todo represent castling
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

    // todo pivot to pieces recalculating legal moves after every move?
    // then show legal moves based on currentSquare
    // and unset currentSquare instead of clearLegalSquares
    move(fromSquare: Square, toSquare: Square) {
        let capturingMove = toSquare.getPiece() !== null;

        // en passant
        if (this.isEnPassant(fromSquare, toSquare)) {
            this.squares[fromSquare.rank][toSquare.file].removePiece()
            capturingMove = true;
        }

        // kingside castle
        if (this.isKingsideCastle(fromSquare, toSquare)) {
            const rook = this.squares[fromSquare.rank][7].removePiece()
            this.squares[fromSquare.rank][5].setPiece(rook);
        }

        if (this.isQueensideCastle(fromSquare, toSquare)) {
            const rook = this.squares[fromSquare.rank][0].removePiece()
            this.squares[fromSquare.rank][3].setPiece(rook);
        }

        this.recordMove(fromSquare, toSquare, capturingMove);

        this.movesAlt.recordMove(fromSquare, toSquare, capturingMove);

        const piece = fromSquare.removePiece();
        toSquare.setPiece(piece);

        this.activeColor = this.activeColor ===
        PieceColour.WHITE ? PieceColour.BLACK : PieceColour.WHITE;
    }

    private isKingsideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            fromSquare.getPiece()?.moveHistory.length == 0 &&
            toSquare.file === 6;
    }

    private isQueensideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            fromSquare.getPiece()?.moveHistory.length == 0 &&
            toSquare.file === 2;
    }

    private isEnPassant(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof Pawn &&
            toSquare.file !== fromSquare.file &&
            this.squares[fromSquare.rank][toSquare.file].getPiece() instanceof Pawn;
    }
}

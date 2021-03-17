import {Square} from "./Square";
import {Pawn} from "@/models/Pawn";
import {Rook} from "@/models/Rook";
import {Bishop} from "@/models/Bishop";
import {Knight} from "@/models/Knight";
import {Queen} from "@/models/Queen";
import {King} from "@/models/King";
import {PieceColour} from "@/models/Piece-Colour";

export class Chessboard {
    squares: Square[][] = [];
    ranks: number = 0;
    files: number = 0;
    moves: string[] = [];
    fen: string = '';

    constructor(ranks: number, files: number) {
        this.ranks = ranks;
        this.files = files;
        //this.init();
        //this.initByFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.initByFen('rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');
    }

    init() {
        let arr: Square[][] = [];
        for (let file = 0; file < this.files; file++) {
            if (!arr[file]) {
                arr[file] = [];
            }
            for (let rank = 0; rank < this.ranks; rank++) {
                arr[file][rank] = new Square(file, rank);
            }
        }

        this.squares = arr;

        for (let rank = 0; rank < this.ranks; rank++) {
            this.squares[1][rank].setPiece(new Pawn(PieceColour.BLACK));
        }

        this.squares[0][0].setPiece(new Rook(PieceColour.BLACK))
        this.squares[0][7].setPiece(new Rook(PieceColour.BLACK))

        this.squares[0][2].setPiece(new Bishop(PieceColour.BLACK))
        this.squares[0][5].setPiece(new Bishop(PieceColour.BLACK))

        this.squares[0][1].setPiece(new Knight(PieceColour.BLACK))
        this.squares[0][6].setPiece(new Knight(PieceColour.BLACK))

        this.squares[0][3].setPiece(new Queen(PieceColour.BLACK))
        this.squares[0][4].setPiece(new King(PieceColour.BLACK))
    }

    initByFen(fen: string) {
        let arr: Square[][] = [];
        for (let file = 0; file < this.files; file++) {
            if (!arr[file]) {
                arr[file] = [];
            }
            for (let rank = 0; rank < this.ranks; rank++) {
                arr[file][rank] = new Square(file, rank);
            }
        }

        this.squares = arr;

        let data = fen.split(' ');
        let rows = data[0].split('/');

        let rank = 0;
        let file = 0;

        for (let row of rows) {
            for (let character of row) {
                if (this.isLetter(character)) {
                    let piece = this.createPieceFromChar(character);

                    if (piece) { // temp?
                        this.squares[rank][file].setPiece(piece);
                    }

                    file += 1;
                } else {
                    let emptySpaces = +character;

                    file += emptySpaces
                }
            }

            file = 0
            rank += 1;
        }
    }

    createPieceFromChar(char: string) {
        switch (char.toLowerCase()) {
            case 'r':
                return new Rook(this.getPieceColor(char))

            case 'n':
                return new Knight(this.getPieceColor(char))

            case 'b':
                return new Bishop(this.getPieceColor(char))

            case 'q':
                return new Queen(this.getPieceColor(char))

            case 'k':
                return new King(this.getPieceColor(char))

            case 'p':
                return new Pawn(this.getPieceColor(char))

            default:
                //throw Error('Unrecognised character in FEN ' + char)
                break;
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
        for (let file of this.squares) {
            for (let square of file) {
                square.isLegal = false;
            }
        }
    }

    move(fromSquare: Square, toSquare: Square) {
        this.moves.push(toSquare.notation());
        let piece = fromSquare.removePiece();
        toSquare.setPiece(piece);
    }
}

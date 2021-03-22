import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/Piece-Colour";
import {MoveHistory, MoveType} from "@/models/Move";

export class Chessboard {
    squares: Square[][] = [];
    ranks: number = 8;
    files: number = 8;
    moveHistory: MoveHistory = new MoveHistory;

    // todo game to fen
    fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    activeColor: PieceColour = PieceColour.WHITE;
    promotions: string[] = ["queen", "knight", "bishop", "rook"];
    promotion: any | null = null;

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

    private static isKingsideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            !fromSquare.getPiece()?.hasMoved &&
            toSquare.file === 6;
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

    // todo pivot to pieces recalculating legal moves after every move?
    // then show legal moves based on currentSquare
    // and unset currentSquare instead of clearLegalSquares

    private static isQueensideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            !fromSquare.getPiece()?.hasMoved &&
            toSquare.file === 2;
    }

    reset() {
        this.moveHistory = new MoveHistory();
        this.init();
    }

    // todo event promotion instead of use data?
    move(fromSquare: Square, toSquare: Square) {
        let capturingMove = toSquare.getPiece() !== null;
        let moveType = MoveType.Standard;

        if (this.isEnPassant(fromSquare, toSquare)) {
            this.squares[fromSquare.rank][toSquare.file].removePiece()
            capturingMove = true;
            moveType = MoveType.EnPassant;
        }

        if (Chessboard.isKingsideCastle(fromSquare, toSquare)) {
            const rook = this.squares[fromSquare.rank][7].removePiece()
            this.squares[fromSquare.rank][5].setPiece(rook);
            moveType = MoveType.KingSideCastle;
        }

        if (Chessboard.isQueensideCastle(fromSquare, toSquare)) {
            const rook = this.squares[fromSquare.rank][0].removePiece()
            this.squares[fromSquare.rank][3].setPiece(rook);
            moveType = MoveType.QueenSideCastle;
        }

        if (Chessboard.isPromotion(fromSquare, toSquare)) {
            const piece = fromSquare.removePiece();
            toSquare.setPiece(piece);
            this.promptPromotion(fromSquare, toSquare);
            return;
        }

        this.moveHistory.recordMove(fromSquare, toSquare, fromSquare.getPiece(), capturingMove, moveType);

        const piece = fromSquare.removePiece();
        toSquare.setPiece(piece);
        piece?.setHasMoved(true);

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;
    }

    promote(fromSquare: Square, toSquare: Square, promotionPiece: string) {
        const pawn = toSquare.removePiece();

        let piece = null;
        switch (promotionPiece) {
            default:
            case "queen":
                piece = new Queen(<PieceColour>pawn?.colour);
                break;
            case "rook":
                piece = new Rook(<PieceColour>pawn?.colour);
                break;
            case "bishop":
                piece = new Bishop(<PieceColour>pawn?.colour);
                break;
            case "knight":
                piece = new Knight(<PieceColour>pawn?.colour);
                break;
        }

        toSquare.setPiece(piece);

        // todo promotion captures
        this.moveHistory.recordMove(fromSquare, toSquare, piece, false, MoveType.Promotion);

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;

        this.promotion = null;
    }

    private static isPromotion(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof Pawn &&
            (toSquare.rank === 0 || toSquare.rank === 7);
    }

    private isEnPassant(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof Pawn &&
            toSquare.file !== fromSquare.file &&
            this.squares[fromSquare.rank][toSquare.file].getPiece() instanceof Pawn;
    }

    private promptPromotion(fromSquare: Square, toSquare: Square) {
        this.promotion = {fromSquare, toSquare};
    }
}

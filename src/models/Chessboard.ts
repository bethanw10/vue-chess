import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {MoveHistory, MoveType} from "@/models/Move";

// todo mobile?
export class Chessboard {
    readonly RANKS: number = 8;
    readonly FILES: number = 8;
    readonly DEFAULT_FEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    fen: string = '';
    squares: Square[][] = [];
    moveHistory: MoveHistory = new MoveHistory;
    activeColor: PieceColour = PieceColour.WHITE;
    promotions: string[] = ["queen", "knight", "bishop", "rook"];
    currentPromotion: any | null = null;

    constructor() {
        this.init();
    }

    init(fen: string = '') {
        this.moveHistory = new MoveHistory();
        this.fen = fen ? fen : this.DEFAULT_FEN;

        this.squares = this.createEmptyBoard();

        const data = this.fen.split(' ');
        const rows = data[0].split('/');
        const active = data[1];
        const castling = data[2];

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
        for (let file = 0; file < this.FILES; file++) {
            if (!arr[file]) {
                arr[file] = [];
            }
            for (let rank = 0; rank < this.RANKS; rank++) {
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

    // todo pivot to pieces recalculating legal moves after every move?
    // then show legal moves based on currentSquare
    // and unset currentSquare instead of clearLegalSquares
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

        const piece = fromSquare.removePiece();
        toSquare.setPiece(piece);
        piece?.setHasMoved(true);

        if (Chessboard.isPromotion(toSquare)) {
            this.promptPromotion(fromSquare, toSquare);
            return;
        }

        this.moveHistory.recordMove(fromSquare, toSquare, toSquare.getPiece(), capturingMove, moveType);

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;
    }

    promote(fromSquare: Square, toSquare: Square, promotionPieceName: string) {
        const pawn = toSquare.removePiece();

        const piece = Chessboard.nameToPiece(promotionPieceName, <PieceColour>pawn?.colour)

        toSquare.setPiece(piece);

        // todo promotion captures
        this.moveHistory.recordMove(fromSquare, toSquare, piece, false, MoveType.Promotion);

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;

        this.currentPromotion = null;
    }

    private static nameToPiece(name: string, color: PieceColour) {
        switch (name) {
            default:
            case "queen":
                return new Queen(color);
            case "rook":
                return new Rook(color);
            case "bishop":
                return new Bishop(color);
            case "knight":
                return new Knight(color);
        }
    }

    private static isKingsideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            !fromSquare.getPiece()?.hasMoved &&
            toSquare.file === 6;
    }

    private static isQueensideCastle(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof King &&
            !fromSquare.getPiece()?.hasMoved &&
            toSquare.file === 2;
    }

    private static isPromotion(toSquare: Square) {
        return toSquare.getPiece() instanceof Pawn &&
            (toSquare.rank === 0 || toSquare.rank === 7);
    }

    private isEnPassant(fromSquare: Square, toSquare: Square) {
        return fromSquare.getPiece() instanceof Pawn &&
            toSquare.file !== fromSquare.file &&
            this.squares[fromSquare.rank][toSquare.file].getPiece() instanceof Pawn;
    }

    private promptPromotion(fromSquare: Square, toSquare: Square) {
        this.currentPromotion = {fromSquare, toSquare};
    }
}
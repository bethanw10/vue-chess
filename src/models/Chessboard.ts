import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/MoveType";
import {MoveHistory} from "@/models/moves/MoveHistory";

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
    promotionInProgress: Move | null = null;

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

        // todo castling, en passant, halftime, full time clock
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

    private createPieceFromChar(char: string) {
        switch (char.toUpperCase()) {
            case 'R':
                return new Rook(this.getPieceColor(char));
            case 'N':
                return new Knight(this.getPieceColor(char));
            case 'B':
                return new Bishop(this.getPieceColor(char));
            case 'Q':
                return new Queen(this.getPieceColor(char));
            case 'K':
                return new King(this.getPieceColor(char));
            case 'P':
                return new Pawn(this.getPieceColor(char));
            default:
                throw Error('Unrecognised character in FEN ' + char);
        }
    }

    private getPieceColor = (pieceChar: string) => /^[A-Z]*$/.test(pieceChar) ? PieceColour.BLACK : PieceColour.WHITE;

    private isLetter = (string: string) => /[a-zA-Z]/.test(string);

    calculateLegalMoves(square: Square) {
        square.getPiece()?.calculateLegalMoves(square, this);
    }

    // todo pivot to pieces recalculating legal moves after every move?
    // todo event promotion instead of use data?
    // todo detect win, draw
    makeMove(move: Move) {
        // todo include captured piece in move info??
        switch (move.type) {
            case MoveType.EnPassant:
                this.squares[move.fromSquare.rank][move.toSquare.file].removePiece();
                break;
            case MoveType.KingSideCastle: {
                const rook = this.squares[move.fromSquare.rank][7].removePiece()
                this.squares[move.fromSquare.rank][5].setPiece(rook);
                break;
            }
            case MoveType.QueenSideCastle: {
                const rook = this.squares[move.fromSquare.rank][0].removePiece()
                this.squares[move.fromSquare.rank][3].setPiece(rook);
                break;
            }
        }

        const piece = move.fromSquare.removePiece();
        move.toSquare.setPiece(piece);
        piece?.setHasMoved(true);

        if (move.type == MoveType.Promotion) {
            this.promotionInProgress = move;
            return;
        }

        this.moveHistory.recordMove(move);

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;
    }

    promote(move: Move, promotionPieceName: string) {
        const pawn = move.toSquare.removePiece();
        const promotedPiece = Chessboard.nameToPiece(promotionPieceName, <PieceColour>pawn?.colour)

        move.toSquare.setPiece(promotedPiece);

        move.piece = promotedPiece;
        this.moveHistory.recordMove(move);

        this.promotionInProgress = null;

        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE;
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
}
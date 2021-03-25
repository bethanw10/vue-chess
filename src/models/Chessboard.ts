import {Square} from "./Square";
import {Pawn} from "@/models/pieces/Pawn";
import {Rook} from "@/models/pieces/Rook";
import {Bishop} from "@/models/pieces/Bishop";
import {Knight} from "@/models/pieces/Knight";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Move} from "@/models/moves/Move";
import {MoveType} from "@/models/moves/MoveType";
import {MoveHistory} from "@/models/moves/MoveHistory";
import {GameResult} from "@/models/GameResult";

// todo mobile?
export class Chessboard {
    readonly RANKS: number = 8;
    readonly FILES: number = 8;
    readonly DEFAULT_FEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    readonly PROMOTIONS: string[] = ["queen", "knight", "bishop", "rook"];

    fen: string = '';
    squares: Square[][] = [];
    moveHistory: MoveHistory = new MoveHistory;
    activeColor: PieceColour = PieceColour.WHITE;
    promotionInProgress: Move | null = null;

    gameState: GameResult = GameResult.InProgress;

    constructor() {
        this.init();
    }

    init(fen: string = '') {
        this.loadFen(fen);
        this.gameState = GameResult.InProgress;
        this.calculateMovesForColor(PieceColour.BLACK);
        this.calculateMovesForColor(PieceColour.WHITE);
    }

    loadFen(fen: string) {
        this.moveHistory = new MoveHistory();
        this.fen = fen ? fen : this.DEFAULT_FEN;

        this.squares = this.createEmptyBoard();

        const data = this.fen.split(' ');
        const rows = data[0].split('/');
        const active = data[1];
        // todo castling, en passant, halftime, full time clock

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

    calculateMovesForColor(color: PieceColour) {
        for (const square of this.squaresIterator(this.squares)) {
            const piece = square.getPiece();

            if (piece && piece.colour === color) {
                piece.updateLegalMoves(square, this);
            }
        }
    }

    // todo detect win, draw
    makeMove(move: Move) {
        this.movePiece(this.squares, move);
        move.piece?.setHasMoved(true);

        if (move.type === MoveType.Promotion) {
            this.promotionInProgress = move;
            return;
        }

        this.moveHistory.recordMove(move);

        this.nextTurn();

        this.calculateMovesForColor(this.activeColor);

        // if king has no legal moves but is not in check, stalemate
        // if king has no legal moves but is in check, checkmate
        const kingSquare = this.kingIsInCheck(this.squares, this.activeColor);
        if (kingSquare) {
            console.log("King is in check!!");
            if (kingSquare.getPiece()?.legalMoves.size === 0) {
                if (this.activeColor === PieceColour.WHITE) {
                    this.gameState = GameResult.BlackWin;
                } else {
                    this.gameState = GameResult.WhiteWin;
                }
            }
        }
    }

    movePiece(squares: Square[][], move: Move) {
        switch (move.type) {
            case MoveType.EnPassant:
                squares[move.fromSquare.rank][move.toSquare.file].removePiece();
                break;

            case MoveType.KingSideCastle: {
                const rook = squares[move.fromSquare.rank][7].removePiece()
                squares[move.fromSquare.rank][5].setPiece(rook);
                break;
            }
            case MoveType.QueenSideCastle: {
                const rook = squares[move.fromSquare.rank][0].removePiece()
                squares[move.fromSquare.rank][3].setPiece(rook);
                break;
            }
        }

        const piece = squares[move.fromSquare.rank][move.fromSquare.file].removePiece();
        squares[move.toSquare.rank][move.toSquare.file].setPiece(piece);
    }

    kingIsInCheck(squares: Square[][], color: PieceColour) {
        for (const square of this.squaresIterator(squares)) {
            const piece = square.getPiece();
            if (piece && piece?.colour != color) {
                const moves = piece.calculateLegalMoves(square, this);

                for (const [, move] of moves) {
                    if (move.capture && move.toSquare.getPiece() instanceof King) {
                        return move.toSquare;
                    }
                }
            }
        }

        return false;
    }

    promote(move: Move, promotionPieceName: string) {
        const pawn = move.toSquare.removePiece();
        const promotedPiece = Chessboard.nameToPiece(promotionPieceName, <PieceColour>pawn?.colour)
        move.toSquare.setPiece(promotedPiece);

        move.piece = promotedPiece;
        this.moveHistory.recordMove(move);

        this.promotionInProgress = null;

        this.nextTurn()
    }

    nextTurn() {
        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE
    }

    * squaresIterator(squares: Square[][]) {
        for (const file of squares) {
            for (const square of file) {
                yield square;
            }
        }
    }

    private static nameToPiece(name: string, color: PieceColour) {
        switch (name) {
            case "queen":
                return new Queen(color);
            case "rook":
                return new Rook(color);
            case "bishop":
                return new Bishop(color);
            case "knight":
                return new Knight(color);
            default:
                throw new Error('Unrecognised piece name ' + name)
        }
    }
}
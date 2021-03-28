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
import {FenUtil} from "@/models/FenUtil";

// todo mobile?
// todo show taken pieces?
// todo board is backwards
// todo diff indicators by move type?
// todo sidebar, overflowing PGN
export class Chessboard {
    readonly PROMOTIONS: string[] = ["queen", "knight", "bishop", "rook"];

    squares: Square[][] = [];
    moveHistory: MoveHistory = new MoveHistory;
    activeColor: PieceColour = PieceColour.WHITE;
    promotionInProgress: Move | null = null;

    gameState: GameResult = GameResult.InProgress;

    constructor() {
        this.init();
    }

    init(fen: string = '') {
        FenUtil.loadFen(fen, this);
        this.gameState = GameResult.InProgress;
        this.updateLegalMoves(PieceColour.BLACK);
        this.updateLegalMoves(PieceColour.WHITE);
        this.checkGameState();
    }

    getFen() {
        return FenUtil.getFen(this.squares, this.activeColor);
    }

    updateLegalMoves(color: PieceColour) {
        let numMoves = 0;
        for (const square of Chessboard.squaresIterator(this.squares)) {
            const piece = square.getPiece();

            if (piece && piece.colour === color) {
                const moves = piece.updateLegalMoves(square, this);
                numMoves += moves.size;
            }
        }

        return numMoves;
    }

    makeMove(move: Move) {
        this.movePiece(this.squares, move);
        move.piece?.setHasMoved(true);

        if (move.type === MoveType.Promotion) {
            this.promotionInProgress = move;
            return;
        }

        this.nextTurn();
        this.moveHistory.recordMove(move);
        this.checkGameState();
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

    promote(move: Move, promotionPieceName: string) {
        const pawn = move.toSquare.removePiece();
        const promotedPiece = Chessboard.nameToPiece(promotionPieceName, <PieceColour>pawn?.colour)
        move.toSquare.setPiece(promotedPiece);

        move.piece = promotedPiece;
        this.promotionInProgress = null;

        this.nextTurn();
        this.moveHistory.recordMove(move);
        this.checkGameState();
    }

    kingIsInCheck(squares: Square[][], color: PieceColour) {
        for (const square of Chessboard.squaresIterator(squares)) {
            const piece = square.getPiece();
            if (piece && piece?.colour != color) {
                const moves = piece.calculateLegalMoves(square, squares, this.moveHistory);

                for (const [, move] of moves) {
                    if (move.capture && move.toSquare.getPiece() instanceof King) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private checkGameState() {
        const numMoves = this.updateLegalMoves(this.activeColor);
        const kingInCheck = this.kingIsInCheck(this.squares, this.activeColor);

        if (kingInCheck) {
            this.moveHistory.recordCheck();
        }

        if (numMoves == 0) {
            if (kingInCheck) {
                this.moveHistory.recordCheckmate();

                this.gameState = this.activeColor === PieceColour.WHITE
                    ? GameResult.BlackWin
                    : GameResult.WhiteWin;
            } else {
                this.gameState = GameResult.Draw
            }
        }
    }

    private nextTurn() {
        this.activeColor = this.activeColor === PieceColour.WHITE
            ? PieceColour.BLACK
            : PieceColour.WHITE
    }

    private static* squaresIterator(squares: Square[][]) {
        for (const file of squares) {
            for (const square of file) {
                yield square;
            }
        }
    }

    private static nameToPiece(name: string, color: PieceColour) {
        switch (name) {
            case "pawn":
                return new Pawn(color);
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
import {MoveHistory} from "@/models/moves/MoveHistory";
import {PieceColour} from "@/models/pieces/Piece-Colour";
import {Chessboard} from "@/models/Chessboard";
import {Rook} from "@/models/pieces/Rook";
import {Knight} from "@/models/pieces/Knight";
import {Bishop} from "@/models/pieces/Bishop";
import {Queen} from "@/models/pieces/Queen";
import {King} from "@/models/pieces/King";
import {Pawn} from "@/models/pieces/Pawn";
import {Square} from "@/models/Square";

export class FenUtil {
    private static DEFAULT_FEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    private static RANKS: number = 8;
    private static FILES: number = 8;

    static loadFen(fen: string, board: Chessboard) {
        board.moveHistory = new MoveHistory();
        fen = fen ? fen : FenUtil.DEFAULT_FEN;

        board.squares = this.createEmptyBoard();

        const data = fen.split(' ');
        const rows = data[0].split('/');
        const active = data[1];
        const castling = data[2];
        const enPassant = data[3];
        const halfTime = data[4];
        const fullTime = data[5];

        board.activeColor = active === 'w' ? PieceColour.WHITE : PieceColour.BLACK;

        let rank = 0;
        let file = 0;

        for (const row of rows) {
            for (const character of row) {
                if (this.isLetter(character)) {
                    const piece = this.createPiece(character);

                    if (piece) {
                        board.squares[rank][file].setPiece(piece);
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

        if (castling) {
            board.moveHistory.setCastlingOverrides(castling);
        }

        if (enPassant && enPassant !== '-') {
            const file = enPassant.charCodeAt(0) - Square.LOWERCASE_CHAR_OFFSET;
            const rank = parseInt(enPassant[1]) - 1;

            board.moveHistory.setEnPassantSquare(board.squares[rank][file]);
        }

        if (halfTime) {
            board.moveHistory.halfTimeClock = parseInt(halfTime);
        }

        if (fullTime) {
            board.moveHistory.fullTimeClock = parseInt(fullTime);
        }
    }

    // todo castling availability, halftime, full time
    static getFen(squares: Square[][], history: MoveHistory, activeColor: PieceColour) {
        let fen = '';

        for (const file of squares) {
            let emptyCount = 0
            for (const square of file) {
                if (square.getPiece()) {
                    if (emptyCount != 0) {
                        fen = fen + emptyCount.toString();
                        emptyCount = 0;
                    }

                    let char = square.getPiece()?.notation;
                    if (square.getPiece()?.colour === PieceColour.BLACK) {
                        char = char?.toLowerCase();
                    }
                    fen += char;
                } else {
                    emptyCount++;
                }
            }

            if (emptyCount != 0) {
                fen = fen + emptyCount.toString();
            }
            fen += '/';
        }

        if (activeColor === PieceColour.WHITE) {
            fen += " w"
        } else {
            fen += " b"
        }

        const lastMove = history.lastMove();
        if (lastMove && lastMove.isPawnDoubleStep()) {
            const targetRank = Math.abs(lastMove.toSquare.rank - lastMove.fromSquare.rank);
            const targetSquare = squares[targetRank][lastMove.toSquare.file];

            fen += targetSquare.notation()
        } else {
            fen += ' -'
        }

        fen += ` ${Math.floor(history.halfTimeClock)}`;
        fen += ` ${history.fullTimeClock}`;

        return fen;
    }

    private static createPiece(char: string) {
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

    private static getPieceColor = (pieceChar: string) => /^[A-Z]*$/.test(pieceChar)
        ? PieceColour.WHITE
        : PieceColour.BLACK;

    private static isLetter = (string: string) => /[a-zA-Z]/.test(string);

    private static createEmptyBoard() {
        const arr: Square[][] = [];
        for (let file = 0; file < FenUtil.FILES; file++) {
            if (!arr[file]) {
                arr[file] = [];
            }
            for (let rank = 0; rank < FenUtil.RANKS; rank++) {
                arr[file][rank] = new Square(file, rank);
            }
        }
        return arr;
    }
}
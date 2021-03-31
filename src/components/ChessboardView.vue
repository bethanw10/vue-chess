<template>
  <div class="board-container">
    <sidebar :board="board" @click="stopMove" @flip="flipBoard"/>
    <div class="squares">
      <GameResultModal v-if="!gameIsInProgress" @newGame="newGame" :result="board.gameState"/>
      <template v-for="(rank, i) in orderedSquares">
        <template :key="square.notation()" v-for="(square, j) in orderedRank(rank)">
          <div
              :id="square.notation()"
              :file="square.file" :rank="square.rank"
              :class="['square', squareColour(i, j)]"
              @click="movePiece(square)"
              @dragover="allowDrop($event)"
              @drop="movePiece(square)">
            <span v-if="j === 0" class="notation rank-left">{{ square.rank + 1 }}</span>
            <span v-if="j === 7" class="notation rank-right">{{ square.rank + 1 }}</span>
            <span v-if="i === 0" class="notation file-top">{{ square.fileLetter() }}</span>
            <span v-if="i === 7" class="notation file-bottom">{{ square.fileLetter() }}</span>
            <img
                v-if="square.getPiece()"
                :class="[{'moveable' : pieceIsMoveable(square)}, 'piece']"
                :draggable="pieceIsMoveable(square)"
                @dragstart="dragStart(square)"
                @click="dragStart(square)"
                @dragend="stopMove()"
                :src="square.getPiece().imageSrc()"
                :alt="square.getPiece().constructor.name"/>
            <div v-if="moveIsLegal(square)" class="move-indicator"/>
            <div v-if="waitingForPromotion(square)" class="promotion">
              <template v-for="promotionPiece in board.PROMOTIONS" :key="promotionPiece">
                <img
                    @click="promote(board.promotionInProgress, promotionPiece)"
                    class="promotion-piece"
                    :src="pieceImg(square.getPiece().colour, promotionPiece)"
                    :alt="promotionPiece"/>
              </template>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import {Chessboard} from "@/models/Chessboard";
import {Piece} from "@/models/pieces/Piece";
import Sidebar from "@/components/Sidebar";
import GameResultModal from "@/components/GameResultModal";
import {GameResult} from "@/models/GameResult";

export default {
  name: 'ChessboardView',
  components: {GameResultModal, Sidebar},
  data() {
    return {
      board: null,
      currentSquare: null,
      gameResults: GameResult,
      flipped: true
    }
  },
  created() {
    this.board = new Chessboard()
  },
  computed: {
    gameIsInProgress() {
      return this.board.gameState === GameResult.InProgress;
    },
    orderedSquares() {
      return this.flipped
          ? this.board.squares.slice().reverse()
          : this.board.squares;
    }
  },
  methods: {
    squareColour(i, j) {
      return (i % 2 === 0) === (j % 2 === 0) ? 'light' : 'dark';
    },
    allowDrop(e) {
      e.preventDefault(); // prevents chrome bug
    },
    dragStart(square) {
      if (square.getPiece()?.colour === this.board.activeColor) {
        this.currentSquare = square;
      }
    },
    moveIsLegal(toSquare) {
      return this.currentSquare &&
          this.currentSquare.getPiece() &&
          this.currentSquare.getPiece().squareIsLegalMove(toSquare);
    },
    stopMove() {
      this.currentSquare = null;
    },
    movePiece(toSquare) {
      if (!this.currentSquare) {
        return;
      }

      if (this.moveIsLegal(toSquare)) {
        let move = this.currentSquare.getMove(toSquare);

        if (move.piece.colour !== this.board.activeColor) {
          return;
        }

        this.board.makeMove(move);
        this.currentSquare = null;
      } else if (!toSquare.getPiece()) {
        this.currentSquare = null;
      }
    },
    pieceIsMoveable(square) {
      return this.board.activeColor === square.getPiece().colour
          && !this.board.promotionInProgress
          && this.gameIsInProgress
    },
    pieceImg(colour, piece) {
      return Piece.imageSrc(colour, piece);
    },
    waitingForPromotion(square) {
      return this.board.promotionInProgress && this.board.promotionInProgress.toSquare === square;
    },
    promote(move, piece) {
      this.board.promote(move, piece);
    },
    orderedRank(file) {
      return !this.flipped
          ? file.slice().reverse()
          : file;
    },
    flipBoard() {
      this.flipped = !this.flipped;
    },
    newGame() {
      // todo repetition
      this.board.init();
    }
  },
}
</script>

<style scoped>

.board-container {
  display: flex;
  font-family: 'Roboto', sans-serif;
  flex-wrap: wrap-reverse;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #ddd;
}

.game-result-container {
  position: absolute;
  background: #3333338a;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 6;
}

.moves-grid span:nth-child(3n-2) {
  text-align: right;
}

.squares {
  position: relative;
  display: grid;
  margin: 32px 16px;
  border-radius: 10px;
  border: rgb(71, 69, 79) solid 32px;
  height: calc(min(100vh, 100vw) - 64px);
  width: calc(min(100vh, 100vw) - 64px);
  grid-template-columns: repeat(8, 12.5%);
  grid-template-rows: repeat(8, 12.5%);
}

@media only screen and (max-width: 900px) {
  .squares {
    margin: 16px;
  }
}

.square {
  width: 100%;
  height: 100%;
  position: relative;
}

.piece {
  width: 100%;
  height: 100%;
  z-index: 5;
  user-select: none;
}

.notation {
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(230 214 202);
  position: absolute;
  font-weight: bold;
  user-select: none;
}

.rank-left {
  left: -20px;
  height: 100%;
}

.rank-right {
  height: 100%;
  right: -20px;
}

.file-top {
  top: -25px;
  width: 100%;
}

.file-bottom {
  bottom: -25px;
  width: 100%;
}

.piece.moveable {
  cursor: grab;
}

.piece.moveable:active {
  cursor: grabbing;
}

.promotion {
  display: grid;
  grid-template-columns: repeat(2, auto);
  position: absolute;
  top: 0;
  background: #acc5aaa3;
  width: 100%;
  height: 100%;
  z-index: 6;
}

.promotion-piece {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.square.light {
  background: rgb(230 214 202);
}

.square.dark {
  background: rgb(171 125 104);
}

.move-indicator {
  height: 40%;
  width: 40%;
  background-color: rgb(0 0 0 / 25%);
  border-radius: 50%;
  position: absolute;
  top: 30%;
  left: 30%;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

.piece + .move-indicator {
  height: 100%;
  width: 100%;
  background-color: #b03535;
  top: 0;
  left: 0;
  mask: radial-gradient(transparent 50%, #000000 50%);
}
</style>

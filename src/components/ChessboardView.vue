<template>
  <div class="board-container">
    <div class="sidebar">
      <span class="fen">FEN: {{ board.getFen() }}</span>
      <br>
      <div>
        <button type="button" @click="newGame()">New Game</button>
      </div>
      <div>
        <input class="fen-input" v-model="fen" type="text" placeholder="Enter FEN"/>
        <button class="" type="button" @click="newGame(fen)">Load</button>
      </div>
      <div class="moves">
        <template v-for="(moveSet, i) in board.moveHistory.moves" :key="i">
          <span>{{ i + 1 }}.</span>
          <span v-if="moveSet.whiteMove"><b>{{ moveSet.whiteMove.toString() }}</b></span> <span v-else></span>
          <span v-if="moveSet.blackMove"><b>{{ moveSet.blackMove.toString() }}</b></span> <span v-else></span>
        </template>
      </div>
    </div>
    <div class="squares">
      <template v-for="(file, i) in board.squares">
        <template :key="square.notation()" v-for="(square, j) in file">
          <div
              :id="square.notation()"
              :file="square.file" :rank="square.rank"
              :class="['square', squareColour(i, j)]"
              @dragover="allowDrop($event)"
              @drop="movePiece(square)">
            <span v-if="square.file === 0" class="notation rank-left">{{ square.rank + 1 }}</span>
            <span v-if="square.file === 7" class="notation rank-right">{{ square.rank + 1 }}</span>
            <span v-if="square.rank === 0" class="notation file-top">{{ square.fileLetter() }}</span>
            <span v-if="square.rank === 7" class="notation file-bottom">{{ square.fileLetter() }}</span>
            <img
                v-if="square.getPiece()"
                :class="[{'moveable' : pieceIsMoveable(square)}, 'piece']"
                :draggable="pieceIsMoveable(square)"
                @dragstart="dragStart(square)"
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
    <div v-if="!gameIsInProgress" class="game-result-container">
      <div v-if="board.gameState === gameResults.WhiteWin" class="game-result">White wins!</div>
      <div v-if="board.gameState === gameResults.BlackWin" class="game-result">Black wins!</div>
      <div v-if="board.gameState === gameResults.Draw" class="game-result">Draw</div>
    </div>
  </div>
</template>

<script>
import {Chessboard} from "@/models/Chessboard";
import {Piece} from "@/models/pieces/Piece";
import {GameResult} from "@/models/GameResult";

export default {
  name: 'ChessboardView',
  data() {
    return {
      board: null,
      currentSquare: null,
      fen: '',
      gameResults: GameResult
    }
  },
  created() {
    this.board = new Chessboard()
  },
  computed: {
    gameIsInProgress() {
      return this.board.gameState === GameResult.InProgress;
    },
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
      if (this.moveIsLegal(toSquare)) {
        let move = this.currentSquare.getMove(toSquare);

        if (move.piece.colour !== this.board.activeColor) {
          return;
        }

        this.board.makeMove(move);
        this.currentSquare = null;
      }
    },
    pieceIsMoveable(square) {
      return this.board.activeColor === square.getPiece().colour && !this.board.promotionInProgress;
    },
    newGame(fen = '') {
      this.board.init(fen);
    },
    pieceImg(colour, piece) {
      return Piece.imageSrc(colour, piece);
    },
    waitingForPromotion(square) {
      return this.board.promotionInProgress && this.board.promotionInProgress.toSquare === square;
    },
    promote(move, piece) {
      this.board.promote(move, piece);
    }
  },
}
</script>

// todo stylus?
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato&family=Roboto&display=swap');

.board-container {
  display: flex;
  font-family: 'Roboto', sans-serif;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: white;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: rgb(71, 69, 79);
  font-size: 14px;
  border-radius: 10px;
  padding: 20px;
  min-width: 25vw;
  align-items: center;
  box-sizing: border-box;
}

.row {
  display: flex;
  width: 100%;
}

.fen {
  width: 25vw;
}

.fen-input {
  flex: 1;
}

.game-result-container {
  position: absolute;
  width: 40vw;
  height: 40vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-result {
  height: 40%;
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  color: #333333;
  border-radius: 5px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 50);
}

.moves {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  grid-column-gap: 20px;
  grid-row-gap: 5px;
  margin: 10px;
  align-items: baseline;
  text-align: left;
}

.moves span:nth-child(3n-2) {
  text-align: right;
}

.squares {
  display: grid;
  box-sizing: border-box;
  margin: 32px;
  border-radius: 10px;
  border: rgb(71, 69, 79) solid 32px;
  height: calc(100vh - 64px);
  width: calc(100vh - 64px);
  grid-template-columns: repeat(8, 12.5%);
  grid-template-rows: repeat(8, 12.5%);
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

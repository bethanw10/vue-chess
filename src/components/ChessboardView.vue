<template>
  <div class="board-container">
    <div class="sidebar">
      <button type="button" @click="newGame()">New Game</button>
      <label> FEN
        <input v-model="fen" type="text"/>
        <button type="button" @click="newGame(fen)">New Game from FEN</button>
      </label>
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
              @drop="movePiece($event, square)">
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
      <div class="game-result">Win!</div>
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
      fen: ''
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
      this.currentSquare = square;
    },
    moveIsLegal(toSquare) {
      return this.currentSquare &&
          this.currentSquare.getPiece() &&
          this.currentSquare.getPiece().squareIsLegalMove(toSquare);
    },
    stopMove() {
      this.currentSquare = null;
    },
    movePiece(e, toSquare) {
      if (this.moveIsLegal(toSquare)) {
        let move = this.currentSquare.getMove(toSquare);
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

<style scoped>
.board-container {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: white;
}

.game-result-container {
  position: absolute;
  width: 40vw;
  height: 40vw;
  background: #48414182;
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
  box-shadow: 0 0.5rem 1.5rem rgba(0 0 0 /50%);
}

.sidebar {
  position: fixed;
  left: 0;
  width: 30vw;
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 50px;
}

.moves {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  grid-column-gap: 20px;
  grid-row-gap: 5px;
  align-items: baseline;
  text-align: left;
}

.moves span:nth-child(3n-2) {
  text-align: right;
}

.squares {
  display: grid;
  border-radius: 10px;
  width: 40vw;
  margin: 5vh;
  height: fit-content;
  grid-template-columns: repeat(8, auto);
  grid-template-rows: repeat(8, auto);
}

.square {
  width: 5vw;
  height: 5vw;
  position: relative;
}

.piece {
  width: 5vw;
  height: 5vw;
  z-index: 5;
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
  width: 5vw;
  height: 5vw;
  z-index: 6;
}

.promotion-piece {
  width: 2.5vw;
  height: 2.5vw;
  cursor: pointer;
}

.square.light {
  background: #eee
}

.square.dark {
  background: #333
}

.move-indicator {
  height: 40%;
  width: 40%;
  background-color: #8cb388;
  border-radius: 50%;
  position: absolute;
  top: 30%;
  left: 30%;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

.square:drop {
  background: #bc5a71;
}

.piece + .move-indicator {
  height: 100%;
  width: 100%;
  background-color: #bc5a71;
  top: 0;
  left: 0;
  mask: radial-gradient(transparent 50%, #000000 50%);
}
</style>

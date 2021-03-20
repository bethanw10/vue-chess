<template>
  <div class="board-container">
    <div class="sidebar">
      <button type="button" class="btn btn-primary" @click="newGame()">New Game</button>
      <p><b>FEN</b>: {{ board.fen }}</p>
      <div class="moves">
        <template v-for="(moveSet, i) in board.moves" :key="i">
          <span>{{ i + 1 }}.</span>
          <span><b>{{ moveSet[0] }}</b></span>
          <span><b>{{ moveSet[1] }}</b></span>
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
              @drag:stop="clearLegalMoves()"
              @dragover="allowDrop($event)"
              @drop="movePiece($event, square)">
            <img
                v-if="square.getPiece()"
                :draggable="pieceIsMoveable(square)"
                class="piece"
                :class="{'moveable' : pieceIsMoveable(square)}"
                @dragstart="dragStart(square)"
                :src="square.getPiece().imageSrc()"
                :alt="square.getPiece().constructor.name"/>
            <div v-if="square.isLegal" class="move-indicator"/>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import {Chessboard} from "@/models/Chessboard";

export default {
  name: 'ChessboardView',
  data() {
    return {
      board: null,
      ranks: 8,
      files: 8,
      currentSquare: null
    }
  },
  created() {
    this.board = new Chessboard()
  },
  methods: {
    squareColour(i, j) {
      return (i % 2 === 0) === (j % 2 === 0) ? 'light' : 'dark';
    },
    allowDrop(e) {
      e.preventDefault(); // prevents chrome bug
    },
    dragStart(square) {
      this.showLegalMoves(square);
      this.currentSquare = square;
    },
    showLegalMoves(square) {
      if (square.getPiece().colour !== this.board.activeColor) {
        return;
      }

      this.board.clearLegalMoves();
      this.board.calculateLegalMoves(square);
    },
    clearLegalMoves() {
      this.board.clearLegalMoves();
    },
    movePiece(e, square) {
      if (square.isLegal) {
        this.board.move(this.currentSquare, square);
        this.clearLegalMoves()
      }
    },
    pieceIsMoveable(square) {
      return this.board.activeColor === square.getPiece().colour;
    },
    newGame() {
      this.board.reset();
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

.sidebar {
  position: fixed;
  left: 0;
  width: 30vw;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.moves {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  grid-column-gap: 20px;
  grid-row-gap: 5px;
  align-items: baseline;
  text-align: left;
}

.moves div:nth-child(3n-3) {
  border: 2px dashed red;
}

.squares {
  display: grid;
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

.piece.moveable {
  cursor: grab;
}

.piece.moveable:active {
  cursor: grabbing;
}

.piece {
  width: 5vw;
  height: 5vw;
  z-index: 5;
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

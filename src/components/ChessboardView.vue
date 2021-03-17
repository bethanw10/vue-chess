<template>
  <div class="board-container">
    <p>{{ board.moves.join(', ') }}</p>
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
                draggable="true"
                class="piece"
                @mousedown="showLegalMoves(square)"
                @dragstart="dragStart(square)"
                :src="square.getPiece().imageSrc()"
                :alt="square.getPiece()"/>
            <div v-if="square.isLegal" class="move-indicator"/>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
//import { Droppable } from '@shopify/draggable';
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
    this.board = new Chessboard(this.ranks, this.files)
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
    showLegalMoves(square) {
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
  }
}
</script>

<style scoped>
.board-container {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.squares {
  display: grid;
  width: fit-content;
  grid-template-columns: repeat(8, auto);
  grid-template-rows: repeat(8, auto);
}

.square {
  width: 100px;
  height: 100px;
  cursor: grab;
  position: relative;
}

.piece:active {
  cursor: grabbing;
}

.piece {
  width: 100px;
  height: 100px;
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
}
</style>

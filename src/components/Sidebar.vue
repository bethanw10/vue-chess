<template>
  <div class="sidebar">
    <div class="fen">
      <span class="title">FEN</span>
      <div>{{ board.getFen() }}</div>
    </div>
    <div class="row">
      <button type="button" @click="newGame">New Game</button>
    </div>
    <div class="row">
      <input class="fen-input" v-model="fen" type="text" placeholder="Enter FEN"/>
      <button type="button" @click="newGame">Load</button>
    </div>
    <div class="history-group">
      <div class="move-history">
        <div class="title">Moves</div>
        <span v-if="board.moveHistory.moves.length === 0"> - </span>
        <div class="moves-grid">
          <template v-for="(moveSet, i) in board.moveHistory.moves" :key="i">
            <span>{{ i + 1 }}.</span>
            <span v-if="moveSet.whiteMove"><b>{{ moveSet.whiteMove.toString() }}</b></span><span v-else>-</span>
            <span v-if="moveSet.blackMove"><b>{{ moveSet.blackMove.toString() }}</b></span><span v-else></span>
          </template>
        </div>
      </div>
      <div class="captured-pieces">
        <div class="title">Captured Pieces</div>
        <span v-if="whiteCapturedPieces.length === 0 && blackCapturedPieces.length === 0"> - </span>
        <div>
          <template v-for="(capturedPiece, i) in whiteCapturedPieces" :key="i">
            <span class="captured-piece">{{ capturedPiece }}</span>
          </template>
        </div>
        <div>
          <template v-for="(capturedPiece, i) in blackCapturedPieces" :key="i">
            <span class="captured-piece">{{ capturedPiece }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {Chessboard} from "@/models/Chessboard";
import {PieceColour} from "@/models/pieces/Piece-Colour";

export default {
  name: 'sidebar',
  props: {
    board: {
      type: Chessboard,
      required: true
    },
  },
  data() {
    return {
      fen: ''
    }
  },
  computed: {
    whiteCapturedPieces() {
      return this.board.moveHistory.capturedPieces[PieceColour.WHITE].slice().sort();
    },
    blackCapturedPieces() {
      return this.board.moveHistory.capturedPieces[PieceColour.BLACK].slice().sort();
    }
  },
  methods: {
    newGame(fen = '') {
      this.board.init(fen);
    },
  }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato&family=Roboto&display=swap');

.sidebar {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  background: rgb(71, 69, 79);
  font-size: 14px;
  border-radius: 10px;
  padding: 20px;
  min-width: 25vw;
  align-items: center;
  box-sizing: border-box;
}

.title {
  font-weight: bold;
  font-size: 18px;
  font-family: 'Lato', sans-serif;
}

.row {
  display: flex;
  width: 100%;
}

.fen {
  margin: 0 0 20px 0;
  width: 25vw;
}

.fen-input {
  flex: 1;
}

.history-group {
  margin: 20px 0;
  display: flex;
  width: 100%;
  min-height: 100%;
  justify-content: space-around;
}

.move-history {
  overflow-y: auto;
}

.moves-grid {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  grid-column-gap: 20px;
  grid-row-gap: 5px;
  margin: 10px;
  align-items: baseline;
  text-align: left;
  font-size: 16px;
}

.moves-grid span:nth-child(3n-2) {
  text-align: right;
}

.captured-piece {
  font-size: 32px;
}

</style>
<template>
  <div class="sidebar">
    <div class="game-controls">
      <div class="section-title">Controls</div>
      <div class="row">
        <button class="wide-button" type="button" @click="newGame">
          New Game &nbsp;<span class="material-icons">add</span>
        </button>
        <button class="wide-button grey" type="button" @click="flipBoard">
          Flip Board &nbsp;<span class="material-icons">repeat</span>
        </button>
      </div>

      <div class="row">
        <input class="fen-input" v-model="fen" type="text" placeholder="Enter FEN"/>
        <button type="button" @click="newGame($event, fen)">Load</button>
      </div>
    </div>
    <div class="game-info">
      <div class="section-title">Game Information</div>
      <div class="fen">
        <div class="title fen-title"><label for="fen">FEN record</label></div>
        <div class="row">
          <input id="fen" class="fen-input" readonly :value="currentFen"/>
          <button class="grey" type="button" @click="copyFen"><span class="material-icons">content_copy</span></button>
        </div>
      </div>
      <div class="history-group">
        <div class="move-history">
          <div class="title">Moves</div>
          <span v-if="board.moveHistory.moves.length === 0"> - </span>
          <div class="moves">
            <div class="moves-grid">
              <template v-for="(moveSet, i) in board.moveHistory.moves" :key="i">
                <span>{{ i + 1 }}. </span>
                <span v-if="moveSet.whiteMove"><b>{{ moveSet.whiteMove.toString() }}</b> </span>
                <span v-else>-</span>
                <span v-if="moveSet.blackMove"><b>{{ moveSet.blackMove.toString() }}</b></span><span v-else></span>
              </template>
            </div>
          </div>
        </div>
        <div class="captured-piece-history">
          <div class="title">Captured Pieces</div>
          <div class="captured-pieces">
            <span v-if="whiteCapturedPieces.length === 0 && blackCapturedPieces.length === 0"> - </span>
            <div class="captured-piece-group">
              <template v-for="(capturedPiece, i) in whiteCapturedPieces" :key="i">
                <span class="captured-piece">{{ capturedPiece }}</span>
              </template>
            </div>
            <div class="captured-piece-group">
              <template v-for="(capturedPiece, i) in blackCapturedPieces" :key="i">
                <span class="captured-piece">{{ capturedPiece }}</span>
              </template>
            </div>
          </div>
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
    },
    currentFen() {
      return this.board.getFen();
    }
  },
  methods: {
    newGame(e, fen = '') {
      this.board.init(fen);
    },
    flipBoard() {
      this.$emit("flip");
    },
    async copyFen() {
      await navigator.clipboard.writeText(this.currentFen);
    },
  }
}
</script>
<style scoped>

.sidebar {
  display: flex;
  flex-direction: column;
  min-height: calc(min(100vh, 100vw) - 64px);
  max-height: calc(min(100vh, 100vw) - 64px);
  background: rgb(71, 69, 79);
  font-size: 14px;
  border-radius: 10px;
  width: 50vw;
  max-width: 550px;
  flex: 1;
  margin: 0 16px 0 32px;
  align-items: center;
}

@media only screen and (max-width: 900px) {
  .sidebar {
    max-height: fit-content;
    max-width: 100vw;
    height: auto;
    margin: 16px 16px 0 16px;
  }
}

.game-controls, .game-info {
  width: 100%;
  padding: 16px 32px 32px;
}

.game-info {
  height: 100%;
  min-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-controls {
  border-bottom: 2px solid #7c7988;
}

.wide-button {
  width: 100%;
  margin-bottom: 10px;
}

.wide-button.grey {
  margin-left: 10px;
}

.title {
  color: #dddddd;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
}

.section-title {
  font-weight: bold;
  font-size: 22px;
  font-family: 'Lato', sans-serif;
  color: white;
  margin-bottom: 15px;
  font-variant-caps: all-small-caps;
}

.row {
  display: flex;
  width: 100%;
}

.fen {
  width: 100%;
}

.fen-input {
  flex: 1;
}

.fen-input {
  flex: 1;
}

.history-group {
  margin-top: 20px;
  display: grid;
  grid-template-columns: minmax(auto, 1fr) 1fr;
  grid-template-rows: minmax(0, 1fr);
  width: 100%;
  min-height: 100%;
  height: 100vh;
  text-align: center;
}

.moves {
  overflow-y: auto;
}

.move-history {
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  text-align: center;
}

.moves-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-column-gap: 15px;
  grid-row-gap: 2px;
  margin: 10px;
  align-items: baseline;
  text-align: left;
  font-size: 16px;
}

.moves-grid span:nth-child(3n-2) {
  text-align: right;
}

.captured-piece-history {
  display: flex;
  flex-direction: column;
}

.captured-pieces {
  overflow-y: auto;
}

.captured-piece-group {
  word-break: break-all;
  font-size: 32px;
}

</style>
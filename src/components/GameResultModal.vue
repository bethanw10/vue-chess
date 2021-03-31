<template>
  <div v-if="!hide" class="game-result-container">
    <div class="game-result">
      <div class="winner">{{ title }}</div>
      <div class="sub-headline">{{ subtitle }}</div>
      <div class="images">
        <img class="king" :src="leftImage" alt="king"/>
        <img class="trophy" :src="rightImage" alt="trophy"/>
      </div>

      <div class="row">
        <button class="new-button" type="button" @click="newGame">
          New Game &nbsp;<span class="material-icons">add_circle_outline</span>
        </button>
        <button class="grey" type="button" @click="close">
          Hide
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import {GameResult} from "@/models/GameResult";
import {Piece} from "@/models/pieces/Piece";

export default {
  name: 'GameResultModal',
  props: {
    result: null,
  },
  data() {
    return {
      gameResults: GameResult,
      hide: false,
    }
  },
  computed: {
    title() {
      switch (this.result) {
        case GameResult.WhiteWin:
          return "White Wins!";
        case GameResult.BlackWin:
          return "Black Wins!";
        case GameResult.Draw:
          return "Draw";
        default:
          return '';
      }
    },
    subtitle() {
      switch (this.result) {
        case GameResult.WhiteWin:
        case GameResult.BlackWin:
          return "by checkmate";
        case GameResult.Draw:
          return "by stalemate";
        default:
          return '';
      }
    },
    leftImage() {
      return this.result === GameResult.BlackWin
          ? this.pieceImg('black', 'king')
          : this.pieceImg('white', 'king');
    },
    rightImage() {
      return this.result === GameResult.Draw
          ? this.pieceImg('black', 'king')
          : require('@/assets/trophy.svg');
    },
  },
  methods: {
    pieceImg(colour, piece) {
      return Piece.imageSrc(colour, piece);
    },
    newGame() {
      this.$emit('newGame');
    },
    close() {
      this.hide = true;
    }
  }
}
</script>
<style scoped>
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

.row {
  display: flex;
}

.new-button {
  margin-right: 10px;
}

.game-result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 50%);
  padding: 20px
}

.king, .trophy {
  width: calc(min(15vh, 115vw));
  height: calc(min(15vh, 115vw));

}

.images {
  margin: 10px 0 20px 0;
}

.winner {
  font-family: 'Ubuntu', sans-serif;
  font-size: 26px;
  color: rgb(71, 69, 79);
  text-align: center;
  width: 100%;
}

.sub-headline {
  color: #b2afb7;
}

</style>
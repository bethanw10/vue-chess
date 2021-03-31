<template>
  <div id="app">
    <ChessboardView/>
  </div>
</template>

<script>
import ChessboardView from './components/ChessboardView.vue'

export default {
  name: 'App',
  components: {
    ChessboardView
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&family=Roboto&family=Ubuntu&display=swap');

* {
  box-sizing: border-box;
}

html, body {
  /*background: rgb(71, 69, 79);*/
  background: rgb(58, 56, 66);
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  appearance: none;
  border: none;
  align-items: center;
  justify-content: center;
  display: flex;
  border-radius: 2px;
  padding: 5px 15px;
  color: #e2e2e2;
  background-color: #68985c;
  font-family: 'Ubuntu', sans-serif;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  min-height: 34px;
}

button:hover {
  background-color: #477239;
}

button.grey {
  background-color: #7b7b7b;
}

button.grey:hover {
  background-color: #525252;
}

</style>

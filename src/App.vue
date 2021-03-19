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
* {
  box-sizing: border-box;
}

html, body {
  background: #2c3e50;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>

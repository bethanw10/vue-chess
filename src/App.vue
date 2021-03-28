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
html, body {
  /*background: rgb(71, 69, 79);*/
  background: rgb(58, 56, 66);
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

</style>

<template>
  <div id="app">
    <ChessboardView msg="Welcome to Your Vue.js App"/>
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
body {
  background: #2c3e50;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>

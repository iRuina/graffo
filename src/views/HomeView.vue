<template>
  <div class="home">
    <img alt="Lupa" src="../assets/logo.png">
    <GraffoAnalyzer/>
  </div>
</template>

<script>
import GraffoAnalyzer from '@/components/GraffoAnalyzer.vue'
export default {
  name: 'HomeView',
  components: {
    GraffoAnalyzer,
  }
}
</script>

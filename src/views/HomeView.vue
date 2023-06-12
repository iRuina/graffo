<template>
  <div class="home">
    <img alt="Lupa" src="../assets/logo.png">
    <GraffoAnalyzerTest/>
  </div>
</template>

<script>
import GraffoAnalyzerTest from '@/components/GraffoAnalyzerTest.vue'
export default {
  name: 'HomeView',
  components: {
    GraffoAnalyzerTest,
  }
}
</script>

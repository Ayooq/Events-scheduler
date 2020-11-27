<template>
  <div class="home">
    <Scheduler />
  </div>
</template>

<script>
  // @ is an alias to /src
  import Scheduler from "@/components/Scheduler.vue";

  export default {
    name: "Home",
    components: {
      Scheduler,
    },
  };
</script>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ name: string }>()

const router = useRouter()
</script>

<template>
  <div>
    <!-- <CarbonConstruction class="text-4xl inline-block" /> -->
    <div class="text-4xl inline-block i-carbon-construction" />

    <p>Hi, {{ props.name }}</p>

    <p class="text-sm opacity-50">
      <em>Dynamic route!</em>
    </p>

    <div>
      <button
        class="text-sm mt-8 m-3 btn"
        @click="router.back()"
      >
        Back
      </button>
    </div>
  </div>
</template>

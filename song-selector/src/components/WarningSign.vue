<template>
  <div class="tooltip-container">
    <!-- SVG Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      :fill="fillColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="warning-icon"
    >
      <path d="M12 2L1 21h22L12 2z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>

    <!-- Tooltip -->
    <div class="tooltip">{{ message }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: { type: Number, default: 1 },
  size: { type: [Number, String], default: 24 },
  message: { type: String, default: '' }
})

const fillColor = computed(() => {
  switch (props.level) {
    case 1: return '#FFCC00'  // yellow
    case 2: return '#FFA500'  // orange
    case 3: return '#FF0000'  // red
    default: return '#FFCC00'
  }
})
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
  cursor: help;
}

/* Tooltip styling */
.tooltip {
  position: absolute;
  bottom: 100%; /* above the icon */
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  padding: 4px 8px;
  background-color: #1f2937; /* dark gray */
  color: #fff;
  font-size: 1.25rem;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  z-index: 10;
}

/* Show tooltip on hover */
.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}
</style>

<template>
  <div class="audio-player">
    <!-- Left controls: play, progress, volume, audio download -->
    <div class="left-controls">
      <!-- Play/Pause -->
      <button @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>

      <!-- Progress -->
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        v-model="progress"
        @input="seek"
        class="progress"
      />

      <!-- Volume -->
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        @input="changeVolume"
        class="volume"
      />

      <!-- Audio download -->
      <a
        :href="src"
        download
        class="download"
        title="Download audio"
      >⬇</a>
    </div>

    <!-- Video download -->
    <a
      v-if="videoSrc"
      :href="videoSrc"
      download
      class="video-download"
      title="Download video"
    >Video Download</a>

    <!-- Hidden audio element -->
    <audio ref="audio" :src="src"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },        // audio source
  videoSrc: { type: String, default: '' }      // optional video source
})

const audio = ref(null)
const isPlaying = ref(false)
const progress = ref(0)
const volume = ref(1)

// Play/Pause
const togglePlay = () => {
  if (!audio.value) return
  audio.value.paused ? audio.value.play() : audio.value.pause()
}

// Progress
const updateProgress = () => {
  if (!audio.value?.duration) return
  progress.value = (audio.value.currentTime / audio.value.duration) * 100
}

// Seek
const seek = () => {
  if (!audio.value?.duration) return
  audio.value.currentTime = (progress.value / 100) * audio.value.duration
}

// Volume
const changeVolume = () => {
  if (audio.value) audio.value.volume = volume.value
}

// Event listeners
const onPlay = () => (isPlaying.value = true)
const onPause = () => (isPlaying.value = false)

onMounted(() => {
  if (!audio.value) return
  audio.value.volume = volume.value
  audio.value.addEventListener('play', onPlay)
  audio.value.addEventListener('pause', onPause)
  audio.value.addEventListener('timeupdate', updateProgress)
})

onBeforeUnmount(() => {
  if (!audio.value) return
  audio.value.removeEventListener('play', onPlay)
  audio.value.removeEventListener('pause', onPause)
  audio.value.removeEventListener('timeupdate', updateProgress)
})
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-wrap: wrap; /* allow items to wrap on small screens */
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 12px;
  width: 100%;
}

.left-controls {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap; /* wrap controls if very tight */
}

button {
  width: 24px;
  height: 24px;
  padding: 0;
  cursor: pointer;
}

input[type='range'] {
  cursor: pointer;
}

.progress {
  width: 80px;
}

.volume {
  width: 50px;
  color:#172554;
}

.download,
.video-download {
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  color: #172554;
}


/* Make video download drop below on narrow screens */
@media (max-width: 400px) {
  .audio-player {
    flex-direction: column;
    align-items: flex-start;
  }

  .video-download {
    margin-top: 4px; /* small spacing from controls */
  }
}
</style>

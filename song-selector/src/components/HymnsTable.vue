<script setup>
import { ref, computed, onMounted } from 'vue'

const hymns = ref([])
const search = ref('')
const hasMediaFilter = ref('')
const loading = ref(true)  // loading indicator

// Fetch JSON remotely with CORS proxy and cache in localStorage
onMounted(async () => {
  const cached = localStorage.getItem('hymns')
  if (cached) {
    hymns.value = JSON.parse(cached)
    loading.value = false
  } else {
    try {
      const res = await fetch(
        'https://api.allorigins.win/raw?url=' +
        encodeURIComponent('https://raw.githubusercontent.com/EnonBaptistChurch/church-data/main/song-selector/Hymns.json')
      )
      const data = await res.json()
      hymns.value = data
      localStorage.setItem('hymns', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to fetch hymns:', err)
    } finally {
      loading.value = false
    }
  }
})

// Filter hymns by title and whether they have a media link
const filteredHymns = computed(() => {
  return hymns.value.filter(h => {
    const matchesTitle = h.Title?.toLowerCase().includes(search.value.toLowerCase())
    const matchesMedia =
      hasMediaFilter.value === ''
        ? true
        : hasMediaFilter.value === 'yes'
        ? !!h.VideoLink
        : !h.VideoLink
    return matchesTitle && matchesMedia
  })
})

function decodeHtml(html) {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}
</script>

<template>
  <div>
    <div v-if="loading" style="text-align: center; margin: 2rem 0;">
      <span>Loading hymns… ⏳</span>
    </div>

    <div v-else>
      <!-- Filters -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <input v-model="search" placeholder="Filter by title…" style="flex: 1; padding: 0.5rem;" />
        <select v-model="hasMediaFilter" style="padding: 0.5rem;">
          <option value="">All</option>
          <option value="yes">Has Media Link</option>
          <option value="no">No Media Link</option>
        </select>
      </div>

      
      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 0.5rem;">Emw Hymn Number</th>
            <th style="border: 1px solid #ccc; padding: 0.5rem;">Title</th>
            <th style="border: 1px solid #ccc; padding: 0.5rem;">Media Source</th>
            <th style="border: 1px solid #ccc; padding: 0.5rem;">Type</th>
            <th style="border: 1px solid #ccc; padding: 0.5rem;">Link</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hymn in filteredHymns" :key="hymn.Number">
            <td style="border: 1px solid #ccc; padding: 0.5rem;">{{ hymn.Number }}</td>
            <td style="border: 1px solid #ccc; padding: 0.5rem;">{{ decodeHtml(hymn.Title) }}</td>
            <td style="border: 1px solid #ccc; padding: 0.5rem;">
              <a v-if="hymn.VideoLink" :href="hymn.VideoLink" target="_blank" rel="noopener">Video Link</a>
              <span v-else>No link</span>
            </td>
            <td style="border: 1px solid #ccc; padding: 0.5rem;">{{ hymn.Type }}</td>
            <td style="border: 1px solid #ccc; padding: 0.5rem;">
              <a v-if="hymn.VideoLink" :href="hymn.VideoLink" target="_blank" rel="noopener">Open</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

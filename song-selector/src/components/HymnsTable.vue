<script setup>
import { ref, computed, onMounted } from 'vue'
import WarningSign from './WarningSign.vue'

const hymns = ref([])
const search = ref('')
const hasMediaFilter = ref('')
const loading = ref(true)
const viewMode = ref('table')
const selectedTag = ref('')
const warningFilter = ref('')

// ------------------ TAGS ------------------
const availableTags = computed(() => {
  const tags = new Set()
  hymns.value.forEach(h => {
    if (Array.isArray(h.Tags)) h.Tags.forEach(t => tags.add(t))
  })
  return Array.from(tags).sort()
})

// ------------------ FETCH ------------------
onMounted(async () => {
  const cached = localStorage.getItem('hymns')
  if (cached) {
    hymns.value = JSON.parse(cached)
    loading.value = false
    return
  }

  try {
    const data = await getHymns()
    hymns.value = data
    localStorage.setItem('hymns', JSON.stringify(data))
  } catch (err) {
    console.error('Failed to fetch hymns:', err)
  } finally {
    loading.value = false
  }
})

// ------------------ FILTERING ------------------
const filteredHymns = computed(() => {
  return hymns.value.filter(h => {
    const matchesTitle = h.Title?.toLowerCase().includes(search.value.toLowerCase())
    const matchesMedia = hasMediaFilter.value === ''
      ? true
      : hasMediaFilter.value === 'yes'
      ? !!h.HymnMedia
      : !h.HymnMedia
    const matchesTag = selectedTag.value === ''
      ? true
      : Array.isArray(h.Tags) && h.Tags.includes(selectedTag.value)
    const matchesWarning = warningFilter.value === ''
      ? true
      : warningFilter.value === 'yes'
      ? !!h.Warning
      : !h.Warning
    return matchesTitle && matchesMedia && matchesTag && matchesWarning
  })
})

// ------------------ HELPERS ------------------
function decodeHtml(html) {
  if (!html) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}
</script>

<template>
  <div class="hymns-container">
    <!-- Loading -->
    <div v-if="loading" class="loading">Loading hymns… ⏳</div>

    <div v-else>
      <!-- Search -->
      <input v-model="search" placeholder="Filter by title…" class="search-input" />

      <!-- Filters -->
      <div class="filters">
        <!-- Media -->
        <div class="filter-group">
          <span class="filter-label">Media:</span>
          <div class="filter-buttons">
            <button :class="{ active: hasMediaFilter === '' }" @click="hasMediaFilter = ''">All</button>
            <button :class="{ active: hasMediaFilter === 'yes' }" @click="hasMediaFilter = 'yes'">Has Media</button>
            <button :class="{ active: hasMediaFilter === 'no' }" @click="hasMediaFilter = 'no'">No Media</button>
          </div>
        </div>

        <!-- Tags -->
        <div class="filter-group">
          <span class="filter-label">Tags:</span>
          <div class="filter-buttons">
            <button :class="{ active: selectedTag === '' }" @click="selectedTag = ''">All</button>
            <button v-for="tag in availableTags" :key="tag" :class="{ active: selectedTag === tag }" @click="selectedTag = tag">{{ tag }}</button>
          </div>
        </div>

        <!-- Warnings -->
        <div class="filter-group">
          <span class="filter-label">Warnings:</span>
          <div class="filter-buttons">
            <button :class="{ active: warningFilter === '' }" @click="warningFilter = ''">All</button>
            <button :class="{ active: warningFilter === 'yes' }" @click="warningFilter = 'yes'">Has</button>
            <button :class="{ active: warningFilter === 'no' }" @click="warningFilter = 'no'">None</button>
          </div>
        </div>
      </div>

      <!-- View toggle -->
      <div class="view-toggle">
        <button @click="viewMode = 'table'" :disabled="viewMode === 'table'">Table</button>
        <button @click="viewMode = 'grid'" :disabled="viewMode === 'grid'">Grid</button>
      </div>

      <div class="summary">{{ filteredHymns.length }} hymns found</div>

      <!-- TABLE VIEW -->
      <table v-if="viewMode === 'table'">
        <thead>
          <tr>
            <th>Number</th>
            <th>Title</th>
            <th>Media</th>
            <th>Type</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hymn in filteredHymns" :key="hymn.Number">
            <td>{{ hymn.Number }}</td>
            <td>
              
              <span v-if="hymn.VideoLink">
                <a :href="hymn.HymnMedia.MediaSourceUrl" target="_blank">{{ decodeHtml(hymn.Title) }}</a>
              </span>
              <span v-else>{{ decodeHtml(hymn.Title)  }}</span>
              {{    }}<WarningSign v-if="hymn.Warning" :level="hymn.Warning.Level" :message="hymn.Warning.Message" />
            </td>
            <td class="media-cell">
              <audio v-if="hymn.HymnMedia?.AudioSourceUrl" :src="hymn.HymnMedia.AudioSourceUrl" controls></audio>
              <a v-if="hymn.HymnMedia?.VideoSourceUrl" :href="hymn.HymnMedia.VideoSourceUrl" target="_blank" class="video-link">Video Download</a>
              <span v-if="!hymn.HymnMedia" class="none-text">None</span>
            </td>
            <td>{{ hymn.Type === 'EMW Christian Hymns' ? 'EMWCH' : hymn.Type }}</td>
            <td>{{ hymn.Warning?.Message || '' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'" class="grid">
        <div v-for="hymn in filteredHymns" :key="hymn.Number" class="card">
          <h3>{{ hymn.Number }}</h3>
          <WarningSign v-if="hymn.Warning" :level="hymn.Warning.Level" :message="hymn.Warning.Message" />
          <p><strong>{{ decodeHtml(hymn.Title) }}</strong></p>
          <p><strong>Type:</strong> {{ hymn.Type }}</p>
          <p>
            <strong>Media:</strong></p>
            <audio v-if="hymn.HymnMedia?.AudioSourceUrl" :src="hymn.HymnMedia.AudioSourceUrl" controls></audio>
            <div>
              <a v-if="hymn.HymnMedia?.VideoSourceUrl" :href="hymn.HymnMedia.VideoSourceUrl" target="_blank" class="video-link">Video Download Link</a>
            </div>
            <p>
            <span v-if="!hymn.HymnMedia" class="none-text">None</span>
            </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.hymns-container {
  font-family: sans-serif;
  font-size: 0.95rem;
  padding: 1rem;
}

/* Loading */
.loading {
  text-align: center;
  margin: 2rem 0;
}

/* Search */
.search-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Filters */
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  min-width: 70px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.filter-buttons button {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.filter-buttons button:hover {
  background: #f0f0f0;
}

.filter-buttons button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* View toggle */
.view-toggle {
  margin: 1rem 0;
}

.view-toggle button {
  margin-right: 0.5rem;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.view-toggle button:disabled {
  background: #e5e5e5;
  cursor: default;
}

/* Summary */
.summary {
  padding: 0.5rem 0;
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
  vertical-align: top;
}

.media-cell {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.video-link {
  color: #2563eb;
  text-decoration: none;
}

.video-link:hover {
  text-decoration: underline;
}

.none-text {
  font-style: italic;
  color: #888;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card {
  border: 1px solid #ccc;
  padding: 0.75rem;
  border-radius: 6px;
  background: #fff;
  font-size: 0.95rem;
}
</style>

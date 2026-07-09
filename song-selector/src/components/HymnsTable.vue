<script setup>
import { ref, computed, onMounted } from 'vue'
import WarningSign from './WarningSign.vue'
import { getHymns } from '../utils/getHymns.ts'
import MiniAudioPlayer from './MiniAudioPlayer.vue'
import GDrive from '../assets/GDrive.vue'
import ChristianHymnsLogo from '../assets/ChristianHymnsLogo.vue'

const hymns = ref([])
const search = ref('')
const hasMediaFilter = ref('')
const loading = ref(true)
const viewMode = ref('table')
const selectedTag = ref('')
const warningFilter = ref('')
const cacheDate = ref(null)

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
    const parsed = JSON.parse(cached)
    hymns.value = parsed.data
    cacheDate.value = parsed.cachedAt
    loading.value = false
    return
  }

  await fetchHymns()
})

async function fetchHymns() {
  try {
    const data = await getHymns()

    const payload = {
      data,
      cachedAt: new Date().toISOString()
    }

    hymns.value = data
    cacheDate.value = payload.cachedAt

    localStorage.setItem('hymns', JSON.stringify(payload))
  } catch (err) {
    console.error('Failed to fetch hymns:', err)
  } finally {
    loading.value = false
  }
}

function resetCache() {
  localStorage.removeItem('hymns')
  loading.value = true
  fetchHymns()
}

// ------------------ FILTERING ------------------
const filteredHymns = computed(() => {
  return hymns.value.filter(h => {
    const matchesTitle = h.Title?.toLowerCase().includes(search.value.toLowerCase())

    const matchesMedia =
      hasMediaFilter.value === ''
        ? true
        : hasMediaFilter.value === 'yes'
        ? !!h.HymnMedia
        : !h.HymnMedia

    const matchesTag =
      selectedTag.value === ''
        ? true
        : Array.isArray(h.Tags) && h.Tags.includes(selectedTag.value)

    const hasWarning = h.HymnMedia?.some(m => m.Warning)

    const matchesWarning =
      warningFilter.value === ''
        ? true
        : warningFilter.value === 'yes'
        ? hasWarning
        : !hasWarning

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

      <!-- Cache info -->
      <div class="cache-info">
        <span v-if="cacheDate"/>
        <button @click="resetCache">Refresh Hymns</button>
      </div>

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
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="{ active: selectedTag === tag }"
              @click="selectedTag = tag"
            >
              {{ tag }}
            </button>
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
            <th>Hymn Number</th>
            <th>Title</th>
            <th>Media</th>
            <th>Notes</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="hymn in filteredHymns" :key="hymn.Number">
            <td>
              <div class="hymn-container">
              {{ hymn.Type == 'EMW Christian Hymns' ? '' : hymn.Type }}

              <ChristianHymnsLogo
                v-if="hymn.Type === 'EMW Christian Hymns'"
                style="vertical-align:middle;"
              />

              {{ hymn.Number }}
                </div>
            </td>

            <td>
              <span v-if="hymn.VideoLink">
                <a :href="hymn.HymnMedia.MediaSourceUrl" target="_blank">
                  {{ decodeHtml(hymn.Title) }}
                </a>
              </span>

              <span v-else>
                {{ decodeHtml(hymn.Title) }}
              </span>
            </td>

            <td class="media-cell">
              <div class="media-inner">

                <template v-if="hymn.HymnMedia?.length">

                  <div class="media-grid">

                    <div
                      v-for="(media, index) in hymn.HymnMedia"
                      :key="media.Id || index"
                      class="media-col"
                    >

                      <MiniAudioPlayer
                        v-if="media.HymnMediaType === 'EMW' && media.AudioSourceUrl"
                        :src="media.AudioSourceUrl"
                        :videoSrc="media.VideoSourceUrl"
                      >
                        <WarningSign
                          v-if="media.Warning"
                          :level="media.Warning.Level"
                          :message="media.Warning.Message"
                        />

                        <p v-if="media.Warning">
                          {{ media.Warning.Message }}
                        </p>
                      </MiniAudioPlayer>

                      <div
                        class="gdrivewrapper"
                        v-else-if="media.HymnMediaType === 'Google Drive'"
                      >

                        <WarningSign
                          v-if="media.Warning"
                          :level="media.Warning.Level"
                          :message="media.Warning.Message"
                        />

                        <p v-if="media.Warning">
                          {{ media.Warning.Message }}
                        </p>

                        <GDrive>
                          Have Audio in Google Drive
                        </GDrive>

                      </div>

                    </div>

                  </div>

                </template>

                <div v-else class="media-col none-text">
                  None
                </div>

              </div>
            </td>

            <td class="notes">
              {{ hymn.Warning?.Message || '' }}
            </td>

          </tr>
        </tbody>
      </table>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'" class="grid">

        <div
          v-for="hymn in filteredHymns"
          :key="hymn.Number"
          class="card"
        >

          <h3>
            <ChristianHymnsLogo
              v-if="hymn.Type === 'EMW Christian Hymns'"
              style="vertical-align:middle;"
            />
            {{ hymn.Number }}
          </h3>

          <p><strong>{{ decodeHtml(hymn.Title) }}</strong></p>

          <p><strong>Media:</strong></p>

          <template v-if="hymn.HymnMedia?.length">

            <div class="media-grid">

              <div
                v-for="(media, index) in hymn.HymnMedia"
                :key="media.Id || index"
                class="media-col"
              >

                <MiniAudioPlayer
                  v-if="media.HymnMediaType === 'EMW' && media.AudioSourceUrl"
                  :src="media.AudioSourceUrl"
                  :videoSrc="media.VideoSourceUrl"
                >
                  <WarningSign
                    v-if="media.Warning"
                    :level="media.Warning.Level"
                    :message="media.Warning.Message"
                  />
                </MiniAudioPlayer>

                <div
                  class="gdrivewrapper"
                  v-else-if="media.HymnMediaType === 'Google Drive'"
                >

                  <WarningSign
                    v-if="media.Warning"
                    :level="media.Warning.Level"
                    :message="media.Warning.Message"
                  />

                  <p v-if="media.Warning">
                    {{ media.Warning.Message }}
                  </p>

                  <GDrive>
                    Have Audio in Google Drive
                  </GDrive>

                </div>

              </div>

            </div>

          </template>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>

.hymns-container {
  font-family: sans-serif;
  font-size: 0.95rem;
  padding: 1rem;
}

.hymn-container {
  display: flex;
}

.loading {
  text-align: center;
  margin: 2rem 0;
}

.cache-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.cache-info button {
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

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
}

.filter-buttons button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.view-toggle {
  margin: 1rem 0;
}

.summary {
  padding: 0.5rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.1rem;
  text-align: left;
  vertical-align: top;
}

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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.25rem;
}

.media-col {
  width: 100%;
}

.none-text {
  font-style: italic;
  color: #888;
}

.gdrivewrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

</style>

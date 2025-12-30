import fs from 'fs'
import path from 'path'
import https from 'https'

const filePath = path.resolve('dev-data/Hymns.json')
console.log('Checking for Hymns.json at', filePath)

if (!fs.existsSync(filePath)) {
  console.log('Fetching Hymns.json for dev...')
  const url = 'https://raw.githubusercontent.com/EnonBaptistChurch/church-data/main/song-selector/Hymns.json'
  
  https.get(url, res => {
    const file = fs.createWriteStream(filePath)
    res.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log('Hymns.json downloaded.')
    })
  }).on('error', err => {
    console.error('Failed to fetch Hymns.json:', err)
  })
} else {
  console.log('Hymns.json already exists locally, skipping fetch.')
}

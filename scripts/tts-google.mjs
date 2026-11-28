// Synthesise one narration with Google Cloud Text-to-Speech.
// Usage: node scripts/tts-google.mjs <voice-name> <out.ogg>   (text on stdin)
// The key comes from GOOGLE_TTS_API_KEY and is sent as a header, never on the command line.
import { readFileSync, writeFileSync } from 'node:fs'

const [voice, out] = process.argv.slice(2)
const key = process.env.GOOGLE_TTS_API_KEY
if (!voice || !out || !key) { console.error('usage: GOOGLE_TTS_API_KEY=... node tts-google.mjs <voice> <out>'); process.exit(2) }
const text = readFileSync(0, 'utf8').trim()
const languageCode = voice.split('-').slice(0, 2).join('-')

// The API takes at most 5000 bytes per request: split long narrations at sentence ends.
const chunks = []
let cur = ''
for (const s of text.split(/(?<=[।.!?])\s+/)) {
  if (Buffer.byteLength(cur + ' ' + s) > 4500 && cur) { chunks.push(cur); cur = s } else cur = cur ? `${cur} ${s}` : s
}
if (cur) chunks.push(cur)

const parts = []
for (const chunk of chunks) {
  let res
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        input: { text: chunk },
        voice: { languageCode, name: voice },
        audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 },
      }),
    })
    if (res.ok || (res.status < 500 && res.status !== 429)) break
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
  }
  if (!res.ok) { console.error(`TTS ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1) }
  const { audioContent } = await res.json()
  const wav = Buffer.from(audioContent, 'base64')
  parts.push(wav.subarray(44)) // strip the WAV header; all parts are 24 kHz mono 16-bit
}
const pcm = Buffer.concat(parts)
const header = Buffer.alloc(44)
header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8)
header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22)
header.writeUInt32LE(24000, 24); header.writeUInt32LE(48000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34)
header.write('data', 36); header.writeUInt32LE(pcm.length, 40)
writeFileSync(out, Buffer.concat([header, pcm]))

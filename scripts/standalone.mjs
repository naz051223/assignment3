import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Bundle compiled React and CSS into one HTML file for file:// use.
const output = resolve('dist')
let html = await readFile(resolve(output, 'app.html'), 'utf8')
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/)
const style = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/)
if (!script || !style) throw new Error('Expected one compiled script and stylesheet')
const js = await readFile(resolve(output, script[1].replace(/^\//, '')), 'utf8')
const css = await readFile(resolve(output, style[1].replace(/^\//, '')), 'utf8')
html = html.replace(script[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`)
html = html.replace(style[0], () => `<style>${css}</style>`)
await writeFile('index.html', html)
await writeFile(resolve(output, 'index.html'), html)
console.log('Created self-contained index.html: double-click to open, no server needed.')

const fs = require('fs')
const path = require('path')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file))
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

const args = process.argv.slice(2)
const src = args[0] || path.resolve(__dirname, '../..', 'my_svelte_site', 'build')
const dest = args[1] || path.resolve(__dirname, '..', 'build')

console.log(`Copying build from ${src} → ${dest}`)
copyRecursive(src, dest)
console.log('Done')

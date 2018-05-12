module.exports = class FsAdapterMemory {
  constructor () {
    this.store = {}
  }
  readFile (path) {
    return this.store[path]
  }
  writeFile (path, content) {
    this.store[path] = content
  }
  removeFile (path) {
    delete this.store[path]
  }
}

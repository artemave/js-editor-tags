module.exports = class FsAdapterMemory {
  constructor () {
    this.store = {}
  }
  readFile (path) {
    const file = this.store[path]
    if (!file) {
      const e = new Error()
      e.code = 'ENOENT'
      throw e
    }
    return file
  }
  writeFile (path, content) {
    this.store[path] = content
  }
  removeFile (path) {
    delete this.store[path]
  }
}

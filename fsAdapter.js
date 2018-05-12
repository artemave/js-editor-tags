const fs = require('fs').promises

module.exports = class FsAdapter {
  async writeFile (path, content) {
    await fs.writeFile(path, content)
  }

  async readFile (path) {
    return fs.readFile(path, 'utf-8')
  }

  async removeFile (path) {
    try {
      await fs.unlink(path)
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e
      }
    }
  }
}

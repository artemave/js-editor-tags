const uniq = require('lowscore/uniq')

module.exports = class BatchRunner {
  constructor () {
    this.batchArgs = []
  }

  addToBatch (arg) {
    this.batchArgs.push(arg)
    if (this.collectingBatch) {
      clearTimeout(this.collectingBatch)
    }
    this.collectingBatch = setTimeout(() => {
      delete this.collectingBatch
    }, 500)
  }

  quit () {
    this.quitNow = true
  }

  async process (fn) {
    return new Promise((resolve, reject) => {
      setInterval(async () => {
        if (!this.processing && !this.collectingBatch && this.batchArgs.length) {
          const batchArgs = uniq(this.batchArgs)
          this.batchArgs = []

          this.processing = true
          await fn(batchArgs)
          delete this.processing

          if (this.quitNow) {
            resolve()
          }
        }
      }, 90)
    })
  }
}

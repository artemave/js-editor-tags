const { spawn } = require('child_process')
const debug = require('debug')('js-tags:shell')

function splitLines (output) {
  return output.split('\n').filter(Boolean)
}

module.exports = class Shell extends Function {
  constructor ({ cwd = process.cwd(), processOutput = splitLines } = {}) {
    async function shell (cmd) {
      debug('Running `%s`', cmd)
      return new Promise((resolve, reject) => {
        const sp = spawn(cmd, [], { cwd, shell: true })
        let result = ''

        sp.stdout.on('data', (data) => {
          result += data
          debug('stdout:', data.toString())
        })
        sp.stderr.on('data', (data) => {
          result += data
          debug('stderr:', data.toString())
        })
        sp.on('close', (code) => {
          if (code === 0) {
            resolve(processOutput(result))
          } else {
            reject(new Error(`Non-zero exit code: ${code}`))
          }
        })
        sp.on('error', (err) => {
          reject(err)
        })
      })
    }
    Object.setPrototypeOf(shell, Shell.prototype)
    shell.cwd = cwd
    return shell
  }
}

#!/usr/bin/env node

const debug = require('debug')('js-tags')
const readline = require('readline')
const globToRegExp = require('glob-to-regexp')
const path = require('path')
const chokidar = require('chokidar')
const BatchRunner = require('./batchRunner')
const Shell = require('./shell')
const App = require('./app')
const argv = require('yargs')
  .options({
    update: {
      alias: 'u',
      describe: 'Update existing tags file instead of creating from scratch',
      type: 'boolean'
    },
    'git-files-only': {
      describe: 'Only tag files that are tracked in git',
      type: 'boolean'
    },
    watch: {
      alias: 'w',
      describe: 'Watch files in changes and update tags file',
      type: 'boolean'
    },
    ignore: {
      array: true,
      describe: 'Ignore path (supports glob)',
      default: []
    }
  }).argv

function notIgnored (path) {
  const patterns = argv.ignore.map((p) => {
    if (p.match(/\*/)) {
      return globToRegExp(p, {globstar: true})
    }
    return new RegExp(`^${p}(?=/|$)`)
  })
  return !patterns.some(p => p.test(path))
}

(async () => {
  try {
    const app = new App({
      tagsFilePath: path.join(process.cwd(), 'tags')
    })
    const batchRunner = new BatchRunner()

    if (process.stdin.isTTY) {
      const sh = new Shell()

      const filesToTag = async () => {
        // TODO: handle --no-git-files-only
        // `git status` is to include deleted staged files
        const files = await sh('{ git ls-files & git status --porcelain -uall | sed s/^...//; } | sort -u')
        return files.filter(notIgnored)
      }

      await app.run(await filesToTag(), argv)

      if (argv.watch) {
        chokidar.watch(process.cwd(), {
          ignored: /node_modules/,
          cwd: process.cwd(),
          ignoreInitial: true
        }).on('all', async (event, path) => {
          debug('%s %s', event, path)
          if (event.match(/add|change|unlink/) && (await filesToTag()).includes(path)) {
            batchRunner.addToBatch(path)
          }
        })
        await batchRunner.process(async (paths) => {
          await app.run(paths, Object.assign({}, argv, {update: true}))
        })
      }
    } else {
      const rl = readline.createInterface({
        input: process.stdin
      })

      rl.on('line', fileToTag => {
        batchRunner.addToBatch(fileToTag)
      })

      rl.on('close', () => {
        batchRunner.quit()
      })
      await batchRunner.process(async (paths) => {
        await app.run(paths, argv)
      })
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  process.exit()
})()

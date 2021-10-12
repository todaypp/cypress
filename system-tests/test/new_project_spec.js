const path = require('path')
const Fixtures = require('../lib/fixtures')
const e2e = require('../lib/e2e').default
const { fs } = require('@packages/server/lib/util/fs')

const noScaffoldingPath = Fixtures.projectPath('no-scaffolding')
const supportPath = path.join(noScaffoldingPath, 'cypress', 'support')

describe('e2e new project', () => {
  e2e.setup()

  it('passes', function () {
    return fs
    .statAsync(supportPath)
    .then(() => {
      throw new Error('support folder should not exist')
    }).catch(() => {
      return e2e.exec(this, {
        project: noScaffoldingPath,
        sanitizeScreenshotDimensions: true,
        snapshot: true,
      })
      .then(() => {
        return fs.statAsync(supportPath)
      })
    })
  })
})
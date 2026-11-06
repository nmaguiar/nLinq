// Run from any directory: node /path/to/nLinq/test/browser-regressions.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')
const bundles = process.argv.length > 2 ? process.argv.slice(2) : ['dist/nlinq.js', 'dist/nlinq.min.js']
const tests = fs.readFileSync(path.join(__dirname, 'query-regressions.js'), 'utf8')
let failures = 0, assertions = 0

// Compare values across VM realms without losing undefined, NaN, sparse holes or special keys.
// Row reference identity is checked explicitly by the shared regression cases.
function normalize(value) {
    if (value === null || typeof value !== 'object') return value
    const result = Array.isArray(value) ? new Array(value.length) : {}
    Object.keys(value).forEach(key => {
        Object.defineProperty(result, key, {
            value: normalize(value[key]), enumerable: true, writable: true, configurable: true
        })
    })
    return result
}

bundles.forEach(bundle => {
    try {
        const filename = path.resolve(root, bundle)
        const context = vm.createContext({ exports: {} })
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename, timeout: 5000 })
        vm.runInContext(tests, context, { filename: 'query-regressions.js', timeout: 5000 })
        Object.keys(context.exports).forEach(name => {
            try {
                context.exports[name](context.nLinq, (actual, expected, message) => {
                    assertions++
                    assert.deepStrictEqual(normalize(actual), normalize(expected), message)
                })
                console.log('PASS ' + bundle + ' ' + name)
            } catch (error) {
                failures++
                console.error('FAIL ' + bundle + ' ' + name + ': ' + error.message)
            }
        })
    } catch (error) {
        failures++
        console.error('FAIL ' + bundle + ': ' + error.message)
    }
})
console.log(assertions + ' assertions; ' + failures + ' failures')
process.exitCode = failures === 0 ? 0 : 1

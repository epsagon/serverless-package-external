const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

module.exports = {
    input: 'index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs',
    },
    plugins: [
        commonjs(),
        (process.env.NODE_ENV === 'production' ? terser({
            warnings: 'verbose',
            compress: {
                warnings: 'verbose',
            },
            mangle: {
                keep_fnames: true,
            },
            output: {
                beautify: false,
            },
        }) : null),
    ],
};

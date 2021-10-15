const mix = require('laravel-mix');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

mix.webpackConfig({
    plugins: [
        new VuetifyLoaderPlugin()
    ]
});

mix.js('resources/js/main.js', 'public/js').vue();

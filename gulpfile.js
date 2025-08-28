const path = require('path');
const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

function copyIcons() {
	// Copy icons to dist/nodes/ structure
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');
	src(nodeSource).pipe(dest(nodeDestination));

	// Copy compiled JS files from dist/ to dist/nodes/ to match package.json paths
	const nodeJsSource = path.resolve('dist', '*', '*.{js,d.ts,js.map}');
	const nodeJsDestination = path.resolve('dist', 'nodes');
	src(nodeJsSource).pipe(dest(nodeJsDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');
	return src(credSource).pipe(dest(credDestination));
}

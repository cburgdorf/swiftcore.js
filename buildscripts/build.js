	// settings
	var FILE_ENCODING = 'utf-8',
		EOL = '\n',
		DIST_FILE_PATH = '../build/swiftcore.js';

	// setup
	var _fs = require('fs');

	function concat(fileList, distPath) {
		var out = fileList.map(function(filePath){
				return _fs.readFileSync(filePath, FILE_ENCODING);
			});
		_fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
		console.log(' '+ distPath +' built.');
	}

	concat([
		'../src/swiftcore.core.js',
		'../src/swiftcore.dependencyFormatters.js',
		'../src/swiftcore.instanceProvider.js',
		'../src/swiftcore.js'
	], DIST_FILE_PATH);
build_cjs:
	npx tsc --module commonjs --outDir cjs/
	echo '{"type": "commonjs"}' > cjs/package.json

build_esm:
	npx tsc --module es2022 --outDir esm/
	echo '{"type": "module"}' > esm/package.json

build: build_cjs build_esm
@echo off

:build_cjs
call npx tsc --module commonjs --outDir cjs/
echo {"type": "commonjs"} > cjs/package.json
goto :build_esm

:build_esm
call npx tsc --module es2022 --outDir esm/
echo {"type": "module"} > esm/package.json
goto :eof

:build
call :build_cjs
call :build_esm
goto :eof
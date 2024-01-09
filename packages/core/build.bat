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
<<<<<<< HEAD
<<<<<<< HEAD
goto :eof
=======
goto :eof
>>>>>>> 66c466c (Update CONTRIBUTING.md for windows installation and add build.bat script for windows users)
=======
goto :eof
>>>>>>> ee480fb (Add instructions for installing TypeScript and NPX, Add instructions for Windows users and create file build.bat)

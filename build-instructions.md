Full Rebuild of project
------------------------
`npm start`

Building of project by Steps
------------------
0. `cd demo/src/beyond-grammar/` -> `tsc beyond-grammar-plugin.ts`, for compiling beyond-grammar-plugin.ts to js
0. return to root `cd ../../..`
0. call `npm run build` - for pre-building React Components from `/lib`
0. `npm run demo` - for starting demo project on http://localhost:4000/full_editor.html


Details
-------
- In case of changes in `/lib` - restart `npm run build`
- In case of changes in `demo/src/beyond-grammar/` - restart `tsc beyond-grammar-plugin.ts`
- Restart `npm run demo` for re-building all projects
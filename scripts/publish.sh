
#!/usr/bin/env bash

cd dist/core
npm publish --access=public

cd ../activity-diagram
npm publish --access=public

cd ../chart-diagram
npm publish --access=public

cd ../class-diagram
npm publish --access=public

cd ../flow-diagram
npm publish --access=public

cd ../layout
npm publish --access=public

cd ../sequence-diagram
npm publish --access=public

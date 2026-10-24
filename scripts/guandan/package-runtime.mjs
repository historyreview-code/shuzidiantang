import {cpSync,writeFileSync} from 'node:fs';
cpSync('cloud-functions','dist/cloud-functions',{recursive:true});
cpSync('edgeone.json','dist/edgeone.json');
writeFileSync('dist/package.json',JSON.stringify({private:true,type:'module',dependencies:{'@edgeone/pages-blob':'0.0.18'}}));
console.log('Guandan EdgeOne functions packaged; no Sites runtime dependency.');

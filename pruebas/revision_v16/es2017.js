const acorn = require('/opt/node-tools/node_modules/acorn');
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/ia.html', 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
try { acorn.parse(m[1], { ecmaVersion: 2017, sourceType: 'script' }); console.log('ES2017: OK'); }
catch (e) { console.log('ES2017 error', e.message, JSON.stringify(m[1].slice(e.pos - 80, e.pos + 40))); }
// API usage checks (Chrome 60): list identifiers of risky APIs
const risky = ['CompressionStream','DecompressionStream','TextDecoder','Blob','IntersectionObserver','ResizeObserver','structuredClone','requestIdleCallback','AbortController','Intl.','toLocaleString','localeCompare','screen.orientation','navigator.vibrate','AudioContext','webkitAudioContext','OffscreenCanvas','createImageBitmap','Path2D','roundRect','ctx.filter','\\.filter =','letterSpacing','fontKerning','conicGradient','createConicGradient','Array.from','Object.assign','Object.values','Object.entries','padStart','padEnd','Number.isFinite','Math.log2','Math.hypot','Math.sign','Math.trunc','Math.cbrt','Promise','Symbol','Set','Map','WeakMap','\\.closest\\(','\\.remove\\(\\)','\\.append\\(','\\.prepend\\(','\\.replaceWith\\(','\\.toggleAttribute','isConnected','\\.then\\('];
for (const r of risky) { const c = (m[1].match(new RegExp(r.replace(/\./g,'\\.').replace(/\\\\\\./g,'\\.'), 'g')) || []).length; if (c) process.stdout.write(r + ':' + c + '  '); }
console.log();

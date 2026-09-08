import { renderIsometricSvg } from './isometricGeometry';

export type ComponentPackageId =
  | 'global-search'
  | 'theme-toggle'
  | 'project-card'
  | 'engagement-bar'
  | 'isometric-mark';

export type ComponentPackage = {
  id: ComponentPackageId;
  title: string;
  prompt: string;
  files: Record<string, string>;
};

const pageShell = (title: string, body: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
${body}
<script src="script.js"></script>
</body>
</html>\n`;

const globalSearchFiles: Record<string, string> = {
  'index.html': pageShell('Global Search', `  <main class="demo-shell">
    <button class="search-trigger" data-search-open aria-label="Open search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <span>Search portfolio</span><kbd>Ctrl K</kbd>
    </button>
  </main>
  <dialog class="search-dialog" data-search-dialog>
    <div class="search-panel">
      <div class="search-input-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        <input data-search-input type="search" autocomplete="off" placeholder="Search pages, projects, blog, components..." />
        <kbd>ESC</kbd>
      </div>
      <p class="search-meta" data-search-status>Type to search public portfolio content.</p>
      <div class="search-results" data-search-results></div>
      <footer><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></footer>
    </div>
  </dialog>`),
  'styles.css': `:root{color-scheme:dark;--bg:#0a0a0a;--surface:#111;--border:#1f1f1f;--strong:#2e2e2e;--text:#e8e8e8;--muted:#8a8a8a;font-family:Inter,Arial,sans-serif}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--text)}.demo-shell{min-height:100vh;display:grid;place-items:center}.search-trigger{display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:var(--muted);font:12px/1 inherit;cursor:pointer}.search-trigger svg,.search-input-row svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}.search-trigger kbd,.search-dialog kbd{border:1px solid var(--border);border-bottom-color:var(--strong);border-radius:4px;padding:3px 5px;background:transparent;color:inherit;font:9px/1 ui-monospace,monospace}.search-dialog{width:min(700px,calc(100vw - 28px));margin:min(12vh,104px) auto auto;padding:0;border:0;background:transparent;color:var(--text)}.search-dialog::backdrop{background:rgb(0 0 0/.64);backdrop-filter:blur(3px)}.search-panel{overflow:hidden;border:1px solid var(--strong);border-radius:8px;background:var(--bg);box-shadow:0 18px 44px rgb(0 0 0/.55)}.search-input-row{min-height:54px;padding:0 14px;display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:10px;border-bottom:1px solid var(--strong);color:var(--muted)}.search-input-row input{width:100%;height:52px;border:0;outline:0;background:transparent;color:var(--text);font:14px/1 inherit}.search-meta{margin:0;padding:9px 14px 8px;border-bottom:1px solid var(--border);color:var(--muted);font-size:11px}.search-results{max-height:54vh;overflow:auto}.group+.group{border-top:1px solid var(--strong)}.group-title{margin:0;padding:8px 13px 7px;border-bottom:1px solid var(--border);color:var(--muted);font:600 9px/1.2 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}.result{min-height:58px;padding:10px 13px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:14px;border-bottom:1px solid var(--border);color:inherit;text-decoration:none}.result:last-child{border-bottom:0}.result[data-active=true]{background:var(--surface)}.result-copy{min-width:0;display:grid;gap:4px}.result-copy strong,.result-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.result-copy strong{font-size:13px}.result-copy span{color:var(--muted);font-size:11px}.kind{color:var(--muted);font:8px/1 ui-monospace,monospace;text-transform:uppercase}.search-panel footer{min-height:38px;padding:8px 11px;display:flex;justify-content:flex-end;align-items:center;gap:14px;border-top:1px solid var(--strong);color:var(--muted);font-size:10px}.search-panel footer span{display:inline-flex;align-items:center;gap:4px}`,
  'script.js': `const entries=[{kind:'page',title:'Overview',description:'Portfolio overview and selected work.',href:'#'},{kind:'page',title:'Components',description:'Reusable portfolio components.',href:'#components'},{kind:'project',title:'MyPaaS',description:'Self-hosted deployment platform.',href:'#mypaas'},{kind:'blog',title:'I Used Linux Before I Cared Who Built It',description:'Notes on Linux and software culture.',href:'#blog'},{kind:'component',title:'Theme Toggle',description:'Pixel-transition theme control.',href:'#theme'}];const order=['page','project','blog','component'];const labels={page:'Pages',project:'Projects',blog:'Blog',component:'Components'};const dialog=document.querySelector('[data-search-dialog]');const input=document.querySelector('[data-search-input]');const results=document.querySelector('[data-search-results]');const status=document.querySelector('[data-search-status]');let links=[];let active=0;const norm=v=>v.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();function setActive(next){if(!links.length)return;active=(next+links.length)%links.length;links.forEach((link,i)=>link.dataset.active=String(i===active));links[active].scrollIntoView({block:'nearest'});}function render(){const q=norm(input.value);const found=entries.filter(e=>!q||norm(e.title+' '+e.description+' '+e.kind).includes(q));results.replaceChildren();links=[];for(const kind of order){const groupEntries=found.filter(e=>e.kind===kind);if(!groupEntries.length)continue;const group=document.createElement('section');group.className='group';const title=document.createElement('p');title.className='group-title';title.textContent=labels[kind];group.append(title);for(const entry of groupEntries){const a=document.createElement('a');a.className='result';a.href=entry.href;const copy=document.createElement('span');copy.className='result-copy';const strong=document.createElement('strong');strong.textContent=entry.title;const desc=document.createElement('span');desc.textContent=entry.description;const type=document.createElement('span');type.className='kind';type.textContent=entry.kind;copy.append(strong,desc);a.append(copy,type);group.append(a);links.push(a);}results.append(group);}status.textContent=found.length?(found.length+' result'+(found.length===1?'':'s')+' shown.'):'No matches.';setActive(0)}function openSearch(){dialog.showModal();input.value='';render();requestAnimationFrame(()=>input.focus())}document.querySelector('[data-search-open]').addEventListener('click',openSearch);document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():openSearch()}if(!dialog.open)return;if(e.key==='ArrowDown'){e.preventDefault();setActive(active+1)}if(e.key==='ArrowUp'){e.preventDefault();setActive(active-1)}if(e.key==='Enter'&&links[active]){e.preventDefault();links[active].click()}});input.addEventListener('input',render);dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});`,
  'README.md': '# Global Search\n\nNative HTML/CSS/JS recreation of the portfolio command palette. Open `index.html`; use Ctrl/Cmd+K, arrows, Enter, and Esc.\n',
};

const themeToggleFiles: Record<string, string> = {
  'index.html': pageShell('Theme Toggle', `  <main class="demo"><button class="theme-toggle" aria-label="Switch theme" aria-pressed="false"><svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.5 4.5l1.55 1.55M17.95 17.95l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.5 19.5l1.55-1.55M17.95 6.05l1.55-1.55"/></svg><svg class="moon" viewBox="0 0 24 24"><path d="M20.2 15.15A8.35 8.35 0 0 1 8.85 3.8 8.4 8.4 0 1 0 20.2 15.15Z"/></svg></button></main>`),
  'styles.css': `:root{--bg:#0a0a0a;--text:#e8e8e8;--muted:#8a8a8a}html[data-theme=light]{--bg:#fafafa;--text:#171717;--muted:#6b6b6b}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--text)}.theme-toggle{width:40px;height:40px;padding:0;display:grid;place-items:center;border:0;background:transparent;color:var(--muted);cursor:pointer}.theme-toggle:hover{color:var(--text)}.theme-toggle svg{grid-area:1/1;width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:0;transform:scale(.84) rotate(-12deg);transition:.16s}.theme-toggle .sun{opacity:1;transform:none}html[data-theme=light] .sun{opacity:0;transform:scale(.84) rotate(12deg)}html[data-theme=light] .moon{opacity:1;transform:none}.pixel-transition{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999}`,
  'script.js': `const button=document.querySelector('.theme-toggle');function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem('theme',theme);button.setAttribute('aria-pressed',String(theme==='light'))}setTheme(localStorage.getItem('theme')==='light'?'light':'dark');button.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';if(matchMedia('(prefers-reduced-motion: reduce)').matches){setTheme(next);return}const canvas=document.createElement('canvas');canvas.className='pixel-transition';document.body.append(canvas);const dpr=Math.min(devicePixelRatio||1,2);const w=innerWidth,h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const cell=Math.max(18,Math.min(32,Math.round(Math.min(w,h)/28)));const rect=button.getBoundingClientRect();const ox=rect.left+rect.width/2,oy=rect.top+rect.height/2;const cells=[];for(let y=0;y<h;y+=cell)for(let x=0;x<w;x+=cell)cells.push({x,y,d:Math.hypot(x-ox,y-oy)+Math.random()*120});cells.sort((a,b)=>a.d-b.d);const palette=next==='light'?['#fafafa','#f1f1f1','#e8e8e8']:['#0a0a0a','#111','#181818'];let i=0;const start=performance.now();function cover(now){const p=Math.min(1,(now-start)/330);const target=Math.ceil(cells.length*(1-Math.pow(1-p,3)));while(i<target){const c=cells[i++];ctx.fillStyle=palette[i%3];ctx.fillRect(c.x,c.y,cell+1,cell+1)}if(p<1){requestAnimationFrame(cover);return}setTheme(next);const clearStart=performance.now();function clear(t){const q=Math.min(1,(t-clearStart)/360);ctx.globalAlpha=1-q;ctx.clearRect(0,0,w,h);if(q<1)requestAnimationFrame(clear);else canvas.remove()}requestAnimationFrame(clear)}requestAnimationFrame(cover)});`,
  'README.md': '# Theme Toggle\n\nNative pixel-transition light/dark theme toggle. No framework dependency.\n',
};

const projectCardFiles: Record<string, string> = {
  'index.html': pageShell('Project Card', `  <main class="demo"><article class="project-card"><a class="project-preview" href="#"><div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="address">example.dev</span><span></span></div><div class="image-wrap"><img src="preview.svg" alt="Project preview" /></div></a><div class="project-info"><div><strong>Project Name</strong><span class="links">GitHub&nbsp;&nbsp;Live</span></div><p>Astro · TypeScript · Docker</p></div></article></main>`),
  'styles.css': `:root{color-scheme:dark;--bg:#0a0a0a;--surface:#111;--border:#1f1f1f;--text:#e8e8e8;--muted:#8a8a8a;font-family:Inter,Arial,sans-serif}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--text)}.demo{min-height:100vh;display:grid;place-items:center;padding:32px}.project-card{width:min(300px,100%);border:1px solid var(--border);background:var(--bg)}.project-preview{display:block;color:inherit;text-decoration:none}.window-bar{height:28px;padding:0 8px;display:grid;grid-template-columns:44px 1fr 44px;align-items:center;border-bottom:1px solid var(--border);background:var(--surface)}.dots{display:flex;gap:4px}.dots i{width:6px;height:6px;border-radius:50%;background:#4a4a4a}.address{overflow:hidden;color:var(--muted);font:8px/1 ui-monospace,monospace;text-align:center;text-overflow:ellipsis;white-space:nowrap}.image-wrap{aspect-ratio:16/9;overflow:hidden}.image-wrap img{width:100%;height:100%;display:block;object-fit:cover;filter:grayscale(1)}.project-info{padding:9px 10px 10px}.project-info>div{display:flex;justify-content:space-between;gap:8px}.project-info strong{font-size:12px}.links{color:var(--muted);font:8px/1 ui-monospace,monospace}.project-info p{margin:6px 0 0;color:var(--muted);font:9px/1.3 ui-monospace,monospace}`,
  'script.js': '',
  'preview.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#111"/><path d="M0 72h640M0 144h640M0 216h640M0 288h640M128 0v360M256 0v360M384 0v360M512 0v360" stroke="#242424"/><rect x="76" y="62" width="488" height="236" rx="8" fill="#181818" stroke="#444"/><rect x="104" y="94" width="180" height="18" fill="#555"/><rect x="104" y="132" width="400" height="10" fill="#333"/><rect x="104" y="158" width="330" height="10" fill="#333"/><rect x="104" y="202" width="128" height="64" fill="#262626"/><rect x="252" y="202" width="252" height="64" fill="#202020"/></svg>`,
  'README.md': '# Project Card\n\nNative HTML/CSS recreation of the monochrome mac-window project card. Replace `preview.svg` and text with project data.\n',
};

const engagementFiles: Record<string, string> = {
  'index.html': pageShell('Engagement Bar', `  <main class="demo"><div class="engage"><span class="item"><span>◉</span><strong data-views>21</strong></span><button class="item" data-like aria-pressed="false"><span>♡</span><strong data-likes>8</strong></button><button class="item" data-share><span>⌁</span><strong data-shares>0</strong></button></div></main><dialog class="share"><div><header><strong>Share this post</strong><button data-close>×</button></header><label>Post link<input value="https://example.com/blog/post" readonly /></label><button data-copy>Copy link</button></div></dialog>`),
  'styles.css': `:root{color-scheme:dark;--bg:#0a0a0a;--surface:#111;--border:#2e2e2e;--text:#e8e8e8;--muted:#8a8a8a;font-family:Inter,Arial,sans-serif}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--text)}.demo{min-height:100vh;display:grid;place-items:center}.engage{display:inline-flex;align-items:center;gap:16px}.item{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:var(--muted);font:11px/1 ui-monospace,monospace}.item:is(button){cursor:pointer}.item:is(button):hover{color:var(--text)}.item[aria-pressed=true]{color:var(--text)}.share{width:min(420px,calc(100vw - 24px));padding:0;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text)}.share::backdrop{background:rgb(0 0 0/.65)}.share>div{padding:16px}.share header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.share header button{border:0;background:transparent;color:var(--muted);font-size:20px;cursor:pointer}.share label{display:grid;gap:6px;color:var(--muted);font-size:11px}.share input{height:38px;padding:0 10px;border:1px solid var(--border);background:var(--surface);color:var(--text)}.share [data-copy]{margin-top:10px;height:36px;width:100%;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer}`,
  'script.js': `const like=document.querySelector('[data-like]'),likes=document.querySelector('[data-likes]'),share=document.querySelector('[data-share]'),shares=document.querySelector('[data-shares]'),dialog=document.querySelector('.share');like.addEventListener('click',()=>{const on=like.getAttribute('aria-pressed')==='true';like.setAttribute('aria-pressed',String(!on));like.querySelector('span').textContent=on?'♡':'♥';likes.textContent=String(Number(likes.textContent)+(on?-1:1))});share.addEventListener('click',()=>dialog.showModal());document.querySelector('[data-close]').addEventListener('click',()=>dialog.close());document.querySelector('[data-copy]').addEventListener('click',async()=>{await navigator.clipboard.writeText(document.querySelector('.share input').value);shares.textContent=String(Number(shares.textContent)+1);dialog.close()});`,
  'README.md': '# Engagement Bar\n\nNative interaction demo for views, likes, and share dialog. Replace local counters with your backend API if required.\n',
};

const isometricSvg = renderIsometricSvg({ character: 'N', depth: 28, hatch: true, guides: true, themeAware: false });
const isometricFiles: Record<string, string> = {
  'index.html': pageShell('Isometric Mark', `  <main class="demo"><img src="mark.svg" alt="Isometric N mark" /></main>`),
  'styles.css': `html{color-scheme:dark;background:#0a0a0a}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a}.demo{width:min(720px,90vw)}img{width:100%;height:auto;display:block}`,
  'script.js': '',
  'mark.svg': isometricSvg,
  'README.md': '# Isometric Mark\n\nNative SVG export using the portfolio NR visual grammar: angular vector contours, ±30° projection, 28px extrusion, hatch and construction guides.\n',
};

export const componentPackages: Record<ComponentPackageId, ComponentPackage> = {
  'global-search': {
    id: 'global-search',
    title: 'Global Search',
    prompt: `Recreate the attached Global Search component exactly as shown. Use only native HTML, CSS and vanilla JavaScript. Match the dark monochrome portfolio design: #0a0a0a background, 1px #2e2e2e outer dialog stroke, 1px internal separators, 8px dialog radius, Inter-style sans copy, compact monospace labels, and no decorative diagonal arrows. The trigger is flat with a search icon plus Ctrl K / Cmd K keycap, with no outer button border. The dialog is centered near the top, about 700px max width. Structure: search input row, status row, grouped results in fixed order Pages / Projects / Blog / Components, then keyboard footer. Each result must have a visible horizontal separator, 13px title, 11px muted description, and small type label at right. Dynamic result elements must receive the same styling as static elements. Behavior: Ctrl/Cmd+K toggles dialog, Esc closes, arrow keys move active result, Enter opens it, clicking backdrop closes, typing performs normalized substring search. Keep keyboard and ARIA behavior. Output index.html, styles.css and script.js.`,
    files: globalSearchFiles,
  },
  'theme-toggle': {
    id: 'theme-toggle',
    title: 'Theme Toggle',
    prompt: `Recreate the portfolio Theme Toggle exactly in native HTML, CSS and vanilla JavaScript. It is a borderless 30–40px icon button using thin-line sun and moon SVG icons. Dark theme uses #0a0a0a / #e8e8e8; light theme uses #fafafa / #171717. Persist the selected theme in localStorage. The distinctive interaction is a full-screen pixel mosaic transition that originates from the toggle button, rapidly covers the viewport with 18–32px square cells using three close shades of the destination theme, switches the document theme while covered, then clears the cells. Respect prefers-reduced-motion by switching instantly. No framework, no external animation library, no diagonal navigation arrows. Output index.html, styles.css and script.js.`,
    files: themeToggleFiles,
  },
  'project-card': {
    id: 'project-card',
    title: 'Project Card',
    prompt: `Recreate the portfolio Project Card exactly using native HTML and CSS with optional vanilla JavaScript only if needed. Monochrome dark visual system, 1px subtle border, no rounded outer card, compact macOS-like browser chrome at the top with three muted dots and a centered tiny domain label, 16:9 grayscale project screenshot, then a compact information row below. Project title uses a small semibold sans font; GitHub and Live labels sit at the right as plain text links with no diagonal arrow icons; stack metadata is tiny muted monospace text underneath. Keep the geometry tight and editorial, not a generic dashboard card. Output index.html, styles.css, script.js and a replaceable preview.svg asset.`,
    files: projectCardFiles,
  },
  'engagement-bar': {
    id: 'engagement-bar',
    title: 'Engagement Bar',
    prompt: `Recreate the portfolio Engagement Bar exactly in native HTML, CSS and vanilla JavaScript. It is a tiny inline monochrome control cluster for views, likes and shares. Use thin icons, muted gray default state, compact monospace numeric counters and no enclosing card. Like is a real button with aria-pressed and toggles between outline and filled heart while changing the count. Share opens a restrained dark modal with a 1px border, post-link field and Copy action. Keep focus behavior accessible, close on explicit close and backdrop, and do not use any framework or diagonal navigation arrows. Output index.html, styles.css and script.js.`,
    files: engagementFiles,
  },
  'isometric-mark': {
    id: 'isometric-mark',
    title: 'Isometric Mark',
    prompt: `Recreate the portfolio isometric mark in the exact NR visual language, not as pixel art, voxel cells or a 5×7 bitmap font. Use a hand-authored angular vector polygon silhouette in a normalized coordinate space with fractional control points like the NR logo, project it on exact ±30° isometric axes, add a 28px vertical extrusion, render only exposed side walls and lower silhouette edges, and use thin monochrome strokes. The top face has sparse diagonal hatch lines clipped to the glyph contour. Add faint construction guides on the same ±30° axes. Corners are sharp and mitered, surfaces are continuous, and there must be no internal square-cell seams. Deliver a native standalone SVG plus minimal index.html, styles.css and script.js.`,
    files: isometricFiles,
  },
};

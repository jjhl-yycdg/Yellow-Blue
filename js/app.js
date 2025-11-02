// 使用全局 DB（db.js 在 file:// 场景下被作为普通脚本加载并挂载到 window.DB）
const DB = window.DB;
// 上传端点（可由页面在 window.UPLOAD_ENDPOINT 中覆盖），默认与页面同源的 /upload
const UPLOAD_ENDPOINT = (window.UPLOAD_ENDPOINT && typeof window.UPLOAD_ENDPOINT === 'string') ? window.UPLOAD_ENDPOINT : '/upload';

// 简单的 i18n（中/英）
const I18N = {
  zh: {
    'search.placeholder': '搜索画师…',
    'search.empty': (q)=>`未找到“${escapeHtml(q)}”`,
    'lang.toggle': '切换语言',
    'theme.toggle': '切换暗/亮主题',
    'upload.tip': '把图片拖到这里上传，或点击选择文件',
    'upload.choose': '选择文件',
    'intro.title': '介绍',
    'albums.title': '相册',
  'intro.bodyHtml': '<p>在这里用文字介绍你的 OC。你可以在代码中维护中英文内容，语言切换会自动展示对应文本。</p>',
    'back.home': '返回主页',
    'album.rename.prompt': '输入新的相册名称',
    'album.delete.confirm': '确认删除此相册及其所有图片？此操作不可恢复',
    'album.notFound': '相册不存在',
    'artist.notFound': '画师不存在',
    'label.filename': '文件名',
    'label.artist': '画师',
    'label.desc': '描述',
    'label.moveToAlbum': '移动到相册',
    'action.save': '保存',
    'image.delete.confirm': '确认删除这张图片？',
    'image.delete.fail': '删除失败，请查看控制台',
    'cover.set.success': '已设置为相册封面',
    'cover.set.fail': '设为封面失败，请查看控制台',
    'error.upload': '上传时发生错误，请查看控制台',
    'error.saveMeta': '保存失败，请查看控制台',
    'error.saveArtist': '保存画师失败，请查看控制台',
    'artist.edit.title': '编辑画师',
    'artist.name': '画师名',
    'artist.view': '查看画师页',
    'prompt.artistName': '画师名（可留空）',
    'prompt.targetAlbum': '上传到哪个相册？输入新相册名以创建或输入已有名',
    'artist.anonymous': '匿名',
    'album.default': '默认相册',
    'album.rename': '重命名相册',
    'album.delete': '删除相册',
    'cover.set': '设为封面',
    'image.delete': '删除图片',
    'artist.open.fail': '无法打开画师页，请查看控制台',
    'select.toggleOn': '选择',
    'select.toggleOff': '完成',
    'select.all': '全选',
    'select.none': '全不选',
    'select.count': (n)=>`已选中 ${n} 项`,
    'batch.move': '移动到相册',
    'batch.setArtist': '设置画师',
    'batch.delete': '删除已选',
    'batch.setArtist.prompt': '输入画师名',
    'batch.delete.confirm': '确认删除已选中的图片？此操作不可恢复',
    'toast.batch.move.done': '已移动',
    'toast.batch.setArtist.done': '已更新画师',
    'toast.batch.delete.done': '已删除',
  },
  en: {
    'search.placeholder': 'Search artists…',
    'search.empty': (q)=>`No results for “${escapeHtml(q)}”`,
    'lang.toggle': 'Switch language',
    'theme.toggle': 'Toggle theme',
    'upload.tip': 'Drag images here, or click to choose files',
    'upload.choose': 'Choose file',
    'intro.title': 'Intro',
    'albums.title': 'Albums',
  'intro.bodyHtml': '<p>Use this area to introduce your OCs. Maintain both Chinese and English in code; the language toggle will show the matching text.</p>',
    'back.home': 'Back Home',
    'album.rename.prompt': 'Enter a new album name',
    'album.delete.confirm': 'Delete this album and all its images? This cannot be undone.',
    'album.notFound': 'Album not found',
    'artist.notFound': 'Artist not found',
    'label.filename': 'Filename',
    'label.artist': 'Artist',
    'label.desc': 'Description',
    'label.moveToAlbum': 'Move to album',
    'action.save': 'Save',
    'image.delete.confirm': 'Delete this image?',
    'image.delete.fail': 'Delete failed, please check console',
    'cover.set.success': 'Set as album cover',
    'cover.set.fail': 'Failed to set as cover, check console',
    'error.upload': 'An error occurred during upload. See console.',
    'error.saveMeta': 'Save failed. See console.',
    'error.saveArtist': 'Saving artist failed. See console.',
    'artist.edit.title': 'Edit Artist',
    'artist.name': 'Artist Name',
    'artist.view': 'Open artist page',
    'prompt.artistName': 'Artist name (optional)',
    'prompt.targetAlbum': 'Which album to upload to? Type a new name to create or use an existing name',
    'artist.anonymous': 'Anonymous',
    'album.default': 'Default Album',
    'album.rename': 'Rename album',
    'album.delete': 'Delete album',
    'cover.set': 'Set as cover',
    'image.delete': 'Delete image',
    'artist.open.fail': 'Failed to open artist page, see console',
    'select.toggleOn': 'Select',
    'select.toggleOff': 'Done',
    'select.all': 'Select all',
    'select.none': 'Clear',
    'select.count': (n)=>`${n} selected`,
    'batch.move': 'Move to album',
    'batch.setArtist': 'Set artist',
    'batch.delete': 'Delete selected',
    'batch.setArtist.prompt': 'Enter artist name',
    'batch.delete.confirm': 'Delete selected images? This cannot be undone.',
    'toast.batch.move.done': 'Moved',
    'toast.batch.setArtist.done': 'Artist updated',
    'toast.batch.delete.done': 'Deleted',
  }
};

function getStoredLang(){ return localStorage.getItem('lang') || 'zh'; }
function setStoredLang(l){ localStorage.setItem('lang', l); }
function t(key, param){
  const lang = getStoredLang();
  const pack = I18N[lang] || I18N.zh;
  const v = pack[key];
  if(typeof v === 'function') return v(param);
  return v || (I18N.zh[key] || key);
}

// 主题（暗/亮）管理 —— 使用 data-theme 和 localStorage
function getStoredTheme(){ return localStorage.getItem('theme'); }
function getPreferredTheme(){
  const stored = getStoredTheme();
  if(stored) return stored;
  if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if(btn){ btn.setAttribute('aria-pressed', theme === 'dark'); }
}
function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

function applyLang(){
  // 设置文档语言属性
  const htmlEl = document.documentElement;
  if(htmlEl){ htmlEl.setAttribute('lang', getStoredLang()==='zh' ? 'zh-CN' : 'en'); }
  // artist search removed — keep DOM if present but do not set placeholder
  const themeBtn = document.getElementById('theme-toggle');
  if(themeBtn){ themeBtn.title = t('theme.toggle'); themeBtn.setAttribute('aria-label', t('theme.toggle')); }
  const langBtn = document.getElementById('lang-toggle');
  if(langBtn){ langBtn.title = t('lang.toggle'); langBtn.setAttribute('aria-label', t('lang.toggle')); }
  const upTip = document.getElementById('upload-tip');
  if(upTip){ upTip.textContent = t('upload.tip'); }
  const uploadLabel = document.querySelector('label[for="fileElem"]');
  if(uploadLabel){ uploadLabel.title = t('upload.choose'); uploadLabel.setAttribute('aria-label', t('upload.choose')); }
  const introTitle = document.getElementById('intro-title');
  if(introTitle){ introTitle.textContent = t('intro.title'); }
  const introBody = document.getElementById('home-intro');
  if(introBody){ introBody.innerHTML = t('intro.bodyHtml'); }
  const albumsTitle = document.getElementById('albums-title');
  if(albumsTitle){ albumsTitle.textContent = t('albums.title'); }
}

function toggleLang(){
  const cur = getStoredLang();
  const next = cur === 'zh' ? 'en' : 'zh';
  setStoredLang(next);
  applyLang();
  renderAlbums();
  route();
}

const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const albumsContainer = document.getElementById('albums');
const mainView = document.getElementById('main-view');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

async function init(){
  // 主题初始化
  applyTheme(getPreferredTheme());
  const tbtn = document.getElementById('theme-toggle');
  if(tbtn) tbtn.addEventListener('click', toggleTheme);
  // 语言初始化与绑定
  applyLang();
  const lbtn = document.getElementById('lang-toggle');
  if(lbtn) lbtn.addEventListener('click', toggleLang);
  // 可编辑首页介绍
  bindHomeIntro();
  // 画师搜索功能已移除；保留 DOM 但不绑定任何事件

  bindUpload();
  await renderAlbums();
  window.addEventListener('hashchange', route);
  route();
}

function bindHomeIntro(){
  const el = document.getElementById('home-intro');
  if(!el) return;
  // 若介绍区不是可编辑的（静态展示），则不进行本地存储加载与事件绑定，避免覆盖代码内文本
  if(!el.isContentEditable) return;
  try{
    const saved = localStorage.getItem('homeIntro') || '';
    if(saved) el.innerHTML = saved;
  }catch{}
  let saveTimer = null;
  const save = ()=>{
    try{ localStorage.setItem('homeIntro', el.innerHTML || ''); }catch{}
  };
  el.addEventListener('input', ()=>{
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  });
  el.addEventListener('blur', save);
}

// bindArtistSearch removed — artist search JS is disabled. Keep any DOM elements intact.

function bindUpload(){
  // If upload UI was removed from the homepage, skip binding to avoid errors
  if(!dropArea || !fileElem) return;
  ['dragenter','dragover'].forEach(e=>dropArea.addEventListener(e,ev=>{ev.preventDefault();dropArea.classList.add('dragover')}));
  ['dragleave','drop'].forEach(e=>dropArea.addEventListener(e,ev=>{ev.preventDefault();dropArea.classList.remove('dragover')}));
  dropArea.addEventListener('drop', async (ev)=>{
    try{
      const files = Array.from(ev.dataTransfer.files);
      await handleFiles(files);
    }catch(err){console.error('drop error', err); alert(t('error.upload'));}
  });
  fileElem.addEventListener('change', async (ev)=>{
    try{
      const files = Array.from(ev.target.files);
      await handleFiles(files);
      fileElem.value = '';
    }catch(err){console.error('file change error', err); alert(t('error.upload'));}
  });
}

async function handleFiles(files){
  for(const f of files){
    if(!f.type.startsWith('image/')) continue;
    // Do not ask for artist information anymore. Keep album prompt (if desired) but default if empty.
    const albumName = prompt(t('prompt.targetAlbum')) || t('album.default');

    // Artist feature removed: do not create or lookup artists. Leave artistId null and artistName empty.
    const artistId = null;
    const artistName = '';

    const albums = await DB.getAll('albums');
    let album = albums.find(a=>a.name===albumName);
    let albumId;
    if(!album){
      albumId = await DB.add('albums',{name:albumName,createdAt:Date.now()});
    } else albumId = album.id;

    const blob = await f.slice();
    // Try upload to server /upload. If it fails, fall back to local DB blob storage.
    let uploadedUrl = null;
    try{
      const fd = new FormData(); fd.append('file', blob, f.name);
  const headers = {};
  if(window.UPLOAD_KEY) headers['x-upload-key'] = window.UPLOAD_KEY;
  const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd, headers });
      if(res.ok){ const j = await res.json(); if(j && j.url) uploadedUrl = j.url; }
    }catch(e){
      // Log upload errors and notify the user, but continue to save blob locally as fallback
      console.error('upload failed', e);
      try{ alert(t('error.upload')); }catch(_){}
    }

    const imgRecord = {filename:f.name,blob:blob,albumId:albumId,artistId:artistId,artistName:artistName,createdAt:Date.now(),desc:'', url: uploadedUrl};
    const imageId = await DB.add('images', imgRecord);
    const alb = await DB.get('albums', albumId);
    if(!alb.previewImageId){alb.previewImageId = imageId; await DB.put('albums', alb)}
  }
  await renderAlbums();
  route();
}

async function renderAlbums(){
  const albums = await DB.getAll('albums');
  albumsContainer.innerHTML = '';
  for(const a of albums){
    const el = document.createElement('div');
    el.className = 'album';
    // 如果有封面，作为背景图
    if(a.previewImageId){
      const rec = await DB.get('images', a.previewImageId);
      let url = rec && rec.url ? rec.url : null;
      if(!url && rec && rec.blob) url = await blobToDataURL(rec.blob);
      if(url){
        el.classList.add('has-cover');
        // 同时设置 CSS 变量与元素背景，确保不同浏览器都能显示
        el.style.setProperty('--cover', `url("${url}")`);
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    }
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<h3>${escapeHtml(a.name)}</h3>`;
    el.appendChild(meta);
    el.addEventListener('click', ()=>{ location.hash = '#/album/'+a.id; });
    albumsContainer.appendChild(el);
  }
}

function escapeHtml(s){return (s+'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

async function route(){
  const hash = location.hash || '';
  // no board polling to clear (polling removed)
  if(hash.startsWith('#/album/')){
    setLayoutDetail(true);
    const id = Number(hash.split('/')[2]);
    await showAlbum(id);
  } else if(hash.startsWith('#/artist/')){
    setLayoutDetail(true);
    const id = Number(hash.split('/')[2]);
    await showArtist(id);
  } else if(hash.startsWith('#/board')){
    setLayoutDetail(true);
    await showBoard();
  } else {
    setLayoutDetail(false);
    showHome();
  }
}

function setLayoutDetail(isDetail){
  const uploadSection = document.getElementById('upload-section');
  const albumsList = document.getElementById('albums-list');
  if(!uploadSection || !albumsList) return;
  if(isDetail){
    uploadSection.classList.add('hidden');
    albumsList.classList.add('hidden');
  } else {
    uploadSection.classList.remove('hidden');
    albumsList.classList.remove('hidden');
  }
}

function showHome(){
  // 主页不占用 main-view 的空间，由顶部上传框与下方相册网格组成
  // 兜底：无论从哪里进入主页，都确保主页布局可见
  setLayoutDetail(false);
  mainView.innerHTML = '';
  // No public gallery on the homepage by default.
}
function getBoardEndpoint(){
  if(window.BOARD_ENDPOINT && typeof window.BOARD_ENDPOINT === 'string') return window.BOARD_ENDPOINT;
  try{
    const u = new URL(UPLOAD_ENDPOINT, location.href);
    return u.origin + '/board/messages';
  }catch(e){ return '/board/messages'; }
}

async function showAlbum(albumId){
  // 兜底：确保进入相册时切换为详情布局
  setLayoutDetail(true);
  const album = await DB.get('albums', albumId);
  if(!album){mainView.innerHTML = `<p>${t('album.notFound')}</p>`;return}
  const images = await DB.getByIndex('images','albumId', albumId);
  const container = document.createElement('div');
  container.classList.add('album-view');
  container.innerHTML = `
    <div class="page-header">
      <button id="back-to-home" class="btn ghost" title="${t('back.home')}" aria-label="${t('back.home')}">←</button>
      <h2>${escapeHtml(album.name)}</h2>
      <div class="album-actions">
           <button id="toggle-select" class="btn ghost icon" title="${t('select.toggleOn')}" aria-label="${t('select.toggleOn')}">☑</button>
           <button id="rename-album" class="btn ghost icon" title="${t('album.rename')}" aria-label="${t('album.rename')}">✎</button>
           <button id="delete-album" class="btn ghost icon danger" title="${t('album.delete')}" aria-label="${t('album.delete')}">🗑</button>
      </div>
    </div>
  `;
  const toolbar = document.createElement('div');
  toolbar.className = 'select-toolbar hidden';
  toolbar.innerHTML = `
    <span class="select-count" id="sel-count"></span>
    <button id="sel-all" class="btn ghost">${t('select.all')}</button>
    <button id="sel-none" class="btn ghost">${t('select.none')}</button>
    <div class="spacer"></div>
    <button id="batch-move" class="btn outline" title="${t('batch.move')}" aria-label="${t('batch.move')}">📁</button>
    <button id="batch-artist" class="btn outline" title="${t('batch.setArtist')}" aria-label="${t('batch.setArtist')}">👤</button>
    <button id="batch-del" class="btn ghost danger" title="${t('batch.delete')}" aria-label="${t('batch.delete')}">🗑</button>
  `;
  container.appendChild(toolbar);

  const gallery = document.createElement('div');gallery.className='gallery';
  container.appendChild(gallery);
  let selectionMode = false;
  const selected = new Set();

  async function buildGallery(){
    gallery.innerHTML = '';
    for(const imgRec of images){
      const card = document.createElement('div');card.className='card';
      card.dataset.id = imgRec.id;
  const im = document.createElement('img');
  // Prefer remote URL, otherwise use blob fallback. If remote fails to load, try blob.
  im.src = imgRec && imgRec.url ? imgRec.url : (imgRec && imgRec.blob ? await blobToDataURL(imgRec.blob) : '');
  im.onerror = async function(){
    try{
      if(imgRec && imgRec.blob){ this.onerror = null; this.src = await blobToDataURL(imgRec.blob); }
      else this.alt = 'Image failed to load';
    }catch(err){ console.error('img onerror fallback failed', err); }
  };
      // 相册页面不显示图片名称与画师名，只展示更大的缩略图
      card.appendChild(im);
      const check = document.createElement('div'); check.className = 'check'; card.appendChild(check);
      if(selected.has(imgRec.id)) card.classList.add('selected');
      card.addEventListener('click', ()=>{
        if(selectionMode){
          if(selected.has(imgRec.id)) selected.delete(imgRec.id); else selected.add(imgRec.id);
          card.classList.toggle('selected');
          updateSelCount();
        } else {
          openImageModal(imgRec.id);
        }
      });
      gallery.appendChild(card);
    }
  }
  function updateSelCount(){
    const el = toolbar.querySelector('#sel-count');
    if(el) el.textContent = t('select.count', selected.size);
  }
  await buildGallery();
  mainView.innerHTML = '';
  mainView.appendChild(container);

  // 绑定返回与相册操作
  document.getElementById('back-to-home').addEventListener('click', ()=>{ location.hash = ''; });
  document.getElementById('rename-album').addEventListener('click', async ()=>{
    const newName = prompt(t('album.rename.prompt'), album.name);
    if(newName && newName.trim()!==album.name){
      album.name = newName.trim();
      await DB.put('albums', album);
      await renderAlbums();
      showAlbum(albumId);
    }
  });
  document.getElementById('delete-album').addEventListener('click', async ()=>{
    if(!confirm(t('album.delete.confirm'))) return;
    // 删除相册内所有图片
    for(const img of images){ await DB.del('images', img.id); }
    await DB.del('albums', albumId);
    await renderAlbums();
    location.hash = '';
  });

  // 选择模式与批量操作绑定
  const toggleBtn = document.getElementById('toggle-select');
  toggleBtn.addEventListener('click', ()=>{
    selectionMode = !selectionMode;
    container.classList.toggle('select-mode', selectionMode);
    toggleBtn.title = selectionMode ? t('select.toggleOff') : t('select.toggleOn');
    toggleBtn.setAttribute('aria-label', toggleBtn.title);
    toolbar.classList.toggle('hidden', !selectionMode);
    updateSelCount();
  });
  toolbar.querySelector('#sel-all').addEventListener('click', ()=>{
    images.forEach(r=>selected.add(r.id));
    buildGallery().then(updateSelCount);
  });
  toolbar.querySelector('#sel-none').addEventListener('click', ()=>{
    selected.clear();
    buildGallery().then(updateSelCount);
  });
  toolbar.querySelector('#batch-del').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    if(!confirm(t('batch.delete.confirm'))) return;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      const oldAlb = await DB.get('albums', rec.albumId);
      // 尝试删除远端对象
      if(rec && rec.url){
        try{ await remoteDeleteUrl(rec.url); }catch(e){ console.warn('batch remote delete failed', e); }
      }
      await DB.del('images', id);
      if(oldAlb && oldAlb.previewImageId === id){
        const others = await DB.getByIndex('images', 'albumId', rec.albumId);
        const next = others.find(o=>o.id!==id);
        oldAlb.previewImageId = next ? next.id : null;
        await DB.put('albums', oldAlb);
      }
    }
    alert(t('toast.batch.delete.done'));
    await renderAlbums();
    showAlbum(albumId);
  });
  toolbar.querySelector('#batch-move').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    const targetName = prompt(t('prompt.targetAlbum')) || '';
    if(!targetName.trim()) return;
    const albums = await DB.getAll('albums');
    let target = albums.find(a=>a.name===targetName.trim());
    let targetId;
    if(!target){ targetId = await DB.add('albums', {name:targetName.trim(), createdAt:Date.now()}); }
    else targetId = target.id;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      const oldAlb = await DB.get('albums', rec.albumId);
      // 更新旧相册封面
      if(oldAlb && oldAlb.previewImageId === id){
        const others = await DB.getByIndex('images', 'albumId', rec.albumId);
        const next = others.find(o=>o.id!==id);
        oldAlb.previewImageId = next ? next.id : null;
        await DB.put('albums', oldAlb);
      }
      // 移动
      rec.albumId = targetId;
      await DB.put('images', rec);
      // 目标相册封面
      const newAlb = await DB.get('albums', targetId);
      if(newAlb && !newAlb.previewImageId){ newAlb.previewImageId = id; await DB.put('albums', newAlb); }
    }
    alert(t('toast.batch.move.done'));
    await renderAlbums();
    showAlbum(albumId);
  });
  toolbar.querySelector('#batch-artist').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    const name = (prompt(t('batch.setArtist.prompt')) || '').trim();
    if(!name) return;
    const artists = await DB.getAll('artists');
    let artist = artists.find(a=>a.name===name);
    let artistId;
    if(!artist){ artistId = await DB.add('artists', {name}); } else artistId = artist.id;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      rec.artistId = artistId; rec.artistName = name;
      await DB.put('images', rec);
    }
    alert(t('toast.batch.setArtist.done'));
    await renderAlbums();
    showAlbum(albumId);
  });

  // 相册页不再显示画师链接，因此无需处理冒泡

}

async function openImageModal(imageId){
  const rec = await DB.get('images', imageId);
  if(!rec) return;
  modalBody.innerHTML = '';
  const img = document.createElement('img');
  img.src = rec && rec.url ? rec.url : (rec && rec.blob ? await blobToDataURL(rec.blob) : '');
  img.style.maxWidth='100%';
  img.onerror = async function(){
    try{ if(rec && rec.blob){ this.onerror = null; this.src = await blobToDataURL(rec.blob); } }catch(err){ console.error('modal img onerror', err); }
  };
  const form = document.createElement('div');
  form.innerHTML = `
    <div class="form-row"><label>${t('label.filename')}</label><input id="f-fn" value="${escapeHtml(rec.filename)}"></div>
    <div class="form-row"><label>${t('label.artist')}</label><input id="f-artist" value="${escapeHtml(rec.artistName)}"></div>
    <div class="form-row"><label>${t('label.desc')}</label><textarea id="f-desc">${escapeHtml(rec.desc||'')}</textarea></div>
    <div style="text-align:right"><button id="save-meta" class="btn">${t('action.save')}</button></div>
  `;
  modalBody.appendChild(img);modalBody.appendChild(form);
  modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  modalClose.onclick = ()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')};
  // 插入移动相册下拉与删除按钮
  const ctrlRow = document.createElement('div');
  ctrlRow.className = 'form-row';
  const albums = await DB.getAll('albums');
  const sel = document.createElement('select');
  sel.id = 'move-to-album';
  for(const a of albums){
    const opt = document.createElement('option'); opt.value = a.id; opt.textContent = a.name; if(a.id===rec.albumId) opt.selected = true; sel.appendChild(opt);
  }
  const moveLabel = document.createElement('label'); moveLabel.textContent = t('label.moveToAlbum');
  ctrlRow.appendChild(moveLabel); ctrlRow.appendChild(sel);
  modalBody.appendChild(ctrlRow);

  const btnRow = document.createElement('div'); btnRow.style.display='flex'; btnRow.style.justifyContent='space-between'; btnRow.style.alignItems='center';
  const leftBtns = document.createElement('div'); leftBtns.style.display='flex'; leftBtns.style.gap='8px';
  const setCoverBtn = document.createElement('button'); setCoverBtn.className='btn ghost icon'; setCoverBtn.textContent='⭐'; setCoverBtn.title=t('cover.set'); setCoverBtn.setAttribute('aria-label',t('cover.set'));
  const viewArtistBtn = document.createElement('button'); viewArtistBtn.className='btn ghost icon'; viewArtistBtn.textContent='👤'; viewArtistBtn.title=t('artist.view'); viewArtistBtn.setAttribute('aria-label',t('artist.view'));
  const delBtn = document.createElement('button'); delBtn.className='btn ghost icon danger'; delBtn.textContent='🗑'; delBtn.title=t('image.delete'); delBtn.setAttribute('aria-label',t('image.delete'));
  leftBtns.appendChild(setCoverBtn); leftBtns.appendChild(viewArtistBtn); leftBtns.appendChild(delBtn);
  const rightBtns = document.createElement('div');
  const saveBtn = document.getElementById('save-meta');
  rightBtns.appendChild(saveBtn);
  btnRow.appendChild(leftBtns); btnRow.appendChild(rightBtns);
  modalBody.appendChild(btnRow);

  // 点击图片放大（尝试全屏，否则在新窗口打开）
  img.style.cursor='zoom-in';
  img.addEventListener('click', ()=>{
    if(img.requestFullscreen) img.requestFullscreen().catch(()=>window.open(img.src));
    else window.open(img.src);
  });

  document.getElementById('save-meta').onclick = async ()=>{
    try{
      rec.filename = document.getElementById('f-fn').value;
      const newArtistName = document.getElementById('f-artist').value;
      rec.desc = document.getElementById('f-desc').value;

      // 查找或创建画师
      const artists = await DB.getAll('artists');
      let artist = artists.find(a=>a.name===newArtistName);
      let artistId;
      if(!artist){
        artistId = await DB.add('artists', { name: newArtistName });
      } else {
        artistId = artist.id;
      }

      // 处理移动相册
      const targetAlbumId = Number(document.getElementById('move-to-album').value);
      const oldAlbumId = rec.albumId;
      if(targetAlbumId && targetAlbumId !== oldAlbumId){
        // 更新 previewImageId of old album if needed
        const oldAlbum = await DB.get('albums', oldAlbumId);
        if(oldAlbum && oldAlbum.previewImageId === rec.id){
          // try to find another image
          const others = await DB.getByIndex('images','albumId', oldAlbumId);
          const next = others.find(o=>o.id !== rec.id);
          oldAlbum.previewImageId = next ? next.id : null;
          await DB.put('albums', oldAlbum);
        }
        // assign to new album
        rec.albumId = targetAlbumId;
        const newAlb = await DB.get('albums', targetAlbumId);
        if(newAlb && !newAlb.previewImageId){ newAlb.previewImageId = rec.id; await DB.put('albums', newAlb); }
      }

      // 更新图片记录的画师信息
      rec.artistId = artistId;
      rec.artistName = newArtistName;
      await DB.put('images', rec);

      modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
      await renderAlbums();
      // 不再自动跳转到画师页，仅刷新当前视图
      route();
    }catch(err){
      console.error('保存元数据失败', err);
      alert(t('error.saveMeta'));
    }
  }

  delBtn.addEventListener('click', async ()=>{
    if(!confirm(t('image.delete.confirm'))) return;
    try{
      // 如果图片有远程 URL，尝试删除远端对象
      if(rec && rec.url){
        try{
          const deleted = await remoteDeleteUrl(rec.url);
          if(!deleted){
            if(!confirm('远端删除失败，仍要从本地删除记录吗？')){ return; }
          }
        }catch(e){
          console.error('remote delete error', e);
          if(!confirm('尝试删除远端失败，仍要从本地删除记录吗？')){ return; }
        }
      }
      await DB.del('images', rec.id);
      // 如果是相册预览图，则尝试更新相册预览
      const alb = await DB.get('albums', rec.albumId);
      if(alb && alb.previewImageId === rec.id){
        const others = await DB.getByIndex('images','albumId', rec.albumId);
        const next = others.find(o=>o.id !== rec.id);
        alb.previewImageId = next ? next.id : null;
        await DB.put('albums', alb);
      }
      modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
      await renderAlbums();
      route();
    }catch(e){console.error('删除失败', e); alert(t('image.delete.fail'))}
  });

  setCoverBtn.addEventListener('click', async ()=>{
    try{
      const alb = await DB.get('albums', rec.albumId);
      if(!alb){ alert(t('album.notFound')); return; }
      alb.previewImageId = rec.id;
      await DB.put('albums', alb);
      await renderAlbums();
      alert(t('cover.set.success'));
    }catch(e){ console.error('设为封面失败', e); alert(t('cover.set.fail')); }
  });

  // 查看画师：根据当前输入的画师名/米画师ID跳转（必要时创建新画师），不强制保存图片元数据
  // 查看画师：根据当前输入的画师名跳转（必要时创建新画师），不强制保存图片元数据
  viewArtistBtn.addEventListener('click', async ()=>{
    try{
      const name = (document.getElementById('f-artist').value || '').trim() || t('artist.anonymous');
      const artists = await DB.getAll('artists');
      let artist = artists.find(a=>a.name===name);
      let artistId;
      if(!artist){
        artistId = await DB.add('artists', { name });
      } else {
        artistId = artist.id;
      }
      modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
      location.hash = '#/artist/' + artistId;
    }catch(e){ console.error('打开画师页失败', e); alert(t('artist.open.fail')); }
  });
}

async function showArtist(artistId){
  // 兜底：确保进入画师页时切换为详情布局
  setLayoutDetail(true);
  const artist = await DB.get('artists', artistId);
  if(!artist){mainView.innerHTML=`<p>${t('artist.notFound')}</p>`;return}
  const imgs = await DB.getByIndex('images','artistId', artistId);
  const container = document.createElement('div');
  container.classList.add('artist-view');
  container.innerHTML = `
    <div class="page-header">
      <button id="back-btn" class="btn ghost" title="${t('back.home')}" aria-label="${t('back.home')}">←</button>
      <h2>${t('label.artist')}: ${escapeHtml(artist.name)}</h2>
      <div class="album-actions">
        <button id="toggle-select" class="btn ghost icon" title="${t('select.toggleOn')}" aria-label="${t('select.toggleOn')}">☑</button>
      </div>
    </div>
    `;
  const toolbar = document.createElement('div');
  toolbar.className = 'select-toolbar hidden';
  toolbar.innerHTML = `
    <span class="select-count" id="sel-count"></span>
    <button id="sel-all" class="btn ghost">${t('select.all')}</button>
    <button id="sel-none" class="btn ghost">${t('select.none')}</button>
    <div class="spacer"></div>
    <button id="batch-move" class="btn outline" title="${t('batch.move')}" aria-label="${t('batch.move')}">📁</button>
    <button id="batch-artist" class="btn outline" title="${t('batch.setArtist')}" aria-label="${t('batch.setArtist')}">👤</button>
    <button id="batch-del" class="btn ghost danger" title="${t('batch.delete')}" aria-label="${t('batch.delete')}">🗑</button>
  `;
  container.appendChild(toolbar);
  const gallery = document.createElement('div');gallery.className='gallery';
  container.appendChild(gallery);
  let selectionMode = false; const selected = new Set();
  async function buildGallery(){
    gallery.innerHTML='';
    for(const rec of imgs){
      const card = document.createElement('div');card.className='card';card.dataset.id = rec.id;
  const im = document.createElement('img');
  im.src = rec && rec.url ? rec.url : (rec && rec.blob ? await blobToDataURL(rec.blob) : '');
  im.onerror = async function(){
    try{ if(rec && rec.blob){ this.onerror = null; this.src = await blobToDataURL(rec.blob); } }catch(e){ console.error('artist img onerror', e); }
  };
      card.appendChild(im);
      const check = document.createElement('div'); check.className = 'check'; card.appendChild(check);
      if(selected.has(rec.id)) card.classList.add('selected');
      card.addEventListener('click', ()=>{
        if(selectionMode){
          if(selected.has(rec.id)) selected.delete(rec.id); else selected.add(rec.id);
          card.classList.toggle('selected');
          updateSelCount();
        } else {
          openImageModal(rec.id);
        }
      });
      gallery.appendChild(card);
    }
  }
  function updateSelCount(){
    const el = toolbar.querySelector('#sel-count');
    if(el) el.textContent = t('select.count', selected.size);
  }
  await buildGallery();
  mainView.innerHTML='';mainView.appendChild(container);

  document.getElementById('back-btn').addEventListener('click', ()=>{ location.hash = ''; });
  // 绑定选择与批量操作
  const toggleBtn = document.getElementById('toggle-select');
  toggleBtn.addEventListener('click', ()=>{
    selectionMode = !selectionMode;
    container.classList.toggle('select-mode', selectionMode);
    toggleBtn.title = selectionMode ? t('select.toggleOff') : t('select.toggleOn');
    toggleBtn.setAttribute('aria-label', toggleBtn.title);
    toolbar.classList.toggle('hidden', !selectionMode);
    updateSelCount();
  });
  toolbar.querySelector('#sel-all').addEventListener('click', ()=>{ imgs.forEach(r=>selected.add(r.id)); buildGallery().then(updateSelCount); });
  toolbar.querySelector('#sel-none').addEventListener('click', ()=>{ selected.clear(); buildGallery().then(updateSelCount); });
  toolbar.querySelector('#batch-del').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    if(!confirm(t('batch.delete.confirm'))) return;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      const oldAlb = await DB.get('albums', rec.albumId);
      // 尝试删除远端对象
      if(rec && rec.url){
        try{ await remoteDeleteUrl(rec.url); }catch(e){ console.warn('batch remote delete failed', e); }
      }
      await DB.del('images', id);
      if(oldAlb && oldAlb.previewImageId === id){
        const others = await DB.getByIndex('images', 'albumId', rec.albumId);
        const next = others.find(o=>o.id!==id);
        oldAlb.previewImageId = next ? next.id : null;
        await DB.put('albums', oldAlb);
      }
    }
    alert(t('toast.batch.delete.done'));
    await renderAlbums();
    showArtist(artistId);
  });
  toolbar.querySelector('#batch-move').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    const targetName = prompt(t('prompt.targetAlbum')) || '';
    if(!targetName.trim()) return;
    const albums = await DB.getAll('albums');
    let target = albums.find(a=>a.name===targetName.trim());
    let targetId;
    if(!target){ targetId = await DB.add('albums', {name:targetName.trim(), createdAt:Date.now()}); }
    else targetId = target.id;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      const oldAlb = await DB.get('albums', rec.albumId);
      if(oldAlb && oldAlb.previewImageId === id){
        const others = await DB.getByIndex('images', 'albumId', rec.albumId);
        const next = others.find(o=>o.id!==id);
        oldAlb.previewImageId = next ? next.id : null;
        await DB.put('albums', oldAlb);
      }
      rec.albumId = targetId;
      await DB.put('images', rec);
      const newAlb = await DB.get('albums', targetId);
      if(newAlb && !newAlb.previewImageId){ newAlb.previewImageId = id; await DB.put('albums', newAlb); }
    }
    alert(t('toast.batch.move.done'));
    await renderAlbums();
    showArtist(artistId);
  });
  toolbar.querySelector('#batch-artist').addEventListener('click', async ()=>{
    if(selected.size===0) return;
    const name = (prompt(t('batch.setArtist.prompt')) || '').trim();
    if(!name) return;
    const artists = await DB.getAll('artists');
    let artistNew = artists.find(a=>a.name===name);
    let artistIdNew;
    if(!artistNew){ artistIdNew = await DB.add('artists', {name}); } else artistIdNew = artistNew.id;
    for(const id of Array.from(selected)){
      const rec = await DB.get('images', id);
      if(!rec) continue;
      rec.artistId = artistIdNew; rec.artistName = name;
      await DB.put('images', rec);
    }
    alert(t('toast.batch.setArtist.done'));
    await renderAlbums();
    showArtist(artistId);
  });
}

// 画师编辑模态
async function openArtistEditModal(artistId){
  const artist = await DB.get('artists', artistId);
  if(!artist){ alert(t('artist.notFound')); return; }
  modalBody.innerHTML = '';
  const form = document.createElement('div');
  form.innerHTML = `
    <h3>${t('artist.edit.title')}</h3>
    <div class="form-row"><label>${t('artist.name')}</label><input id="a-name" value="${escapeHtml(artist.name)}"></div>
    <div style="text-align:right;display:flex;gap:8px;justify-content:flex-end;align-items:center">
      <button id="open-artist-page" class="btn ghost icon" type="button" title="${t('artist.view')}" aria-label="${t('artist.view')}">👤</button>
      <button id="save-artist" class="btn" type="button">${t('action.save')}</button>
    </div>
  `;
  modalBody.appendChild(form);
  modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  modalClose.onclick = ()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')};

  document.getElementById('open-artist-page').onclick = ()=>{ location.hash = '#/artist/'+artistId; };
  document.getElementById('save-artist').onclick = async ()=>{
    try{
      const newName = document.getElementById('a-name').value.trim() || t('artist.anonymous');
      artist.name = newName;
      await DB.put('artists', artist);
      // 同步更新该画师的所有图片上的冗余字段
      const imgs = await DB.getByIndex('images','artistId', artistId);
      for(const rec of imgs){
        rec.artistName = newName; await DB.put('images', rec);
      }
      modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
      await renderAlbums();
      // 如果当前在画师页，则刷新
      if((location.hash||'').startsWith('#/artist/')){ showArtist(artistId); }
    }catch(err){ console.error('保存画师失败', err); alert(t('error.saveArtist')); }
  };
}

function blobToDataURL(blob){
  return new Promise((resolve)=>{
    const fr = new FileReader();fr.onload = ()=>resolve(fr.result);fr.readAsDataURL(blob);
  });
}

function getStaticPhotoPath(){
  try{ return (window.STATIC_PHOTO_PATH && typeof window.STATIC_PHOTO_PATH === 'string') ? window.STATIC_PHOTO_PATH.replace(/\/$/, '') : './static_photos'; }
  catch(e){ return './static_photos'; }
}

async function fetchStaticManifest(){
  const base = getStaticPhotoPath();
  const manifestUrl = base + '/manifest.json';
  try{
    const res = await fetch(manifestUrl, { cache: 'no-store' });
    if(!res.ok) return null;
    const j = await res.json();
    if(Array.isArray(j.files)) return j.files;
    return null;
  }catch(e){ return null; }
}

function loadBoardMessages(){
  try{
    const raw = localStorage.getItem('board_messages') || '[]';
    return JSON.parse(raw);
  }catch(e){ return []; }
}

function saveBoardMessages(list){
  try{ localStorage.setItem('board_messages', JSON.stringify(list)); }catch(e){ console.error('saveBoardMessages failed', e); }
}

async function showBoard(){
  const photos = await fetchStaticManifest();
  mainView.innerHTML = '';
  // no persistent polling: we'll attempt a one-time sync on entry
  const container = document.createElement('div'); container.className = 'board-view';
  container.innerHTML = `
    <div class="page-header">
      <button id="back-to-home-board" class="btn ghost">←</button>
      <h2>留言板</h2>
    </div>
    <div class="board-area">
      <div id="board-drop-area" class="drop-area" style="margin-bottom:12px;padding:12px;border:1px dashed #bbb;">
        <p>把图片拖到这里上传，或点击选择文件（上传的图片会显示到留言板）</p>
        <input id="board-fileElem" type="file" accept="image/*" multiple style="display:none" />
        <label class="btn ghost" for="board-fileElem">选择文件上传</label>
      </div>
      <form id="board-form" style="margin-bottom:16px">
        <div><input id="board-author" placeholder="你的名字（可选）" style="width:100%"></div>
        <div style="margin-top:8px"><textarea id="board-text" placeholder="写点什么…" style="width:100%" rows="3"></textarea></div>
        <div style="margin-top:8px">
          </div>
        <div style="text-align:right;margin-top:8px"><button id="board-post" class="btn">发布</button></div>
      </form>
      <div id="board-list"></div>
    </div>
  `;
  mainView.appendChild(container);
  document.getElementById('back-to-home-board').addEventListener('click', ()=>{ location.hash = ''; });

  // static manifest loaded (not used for board selection anymore)

  function renderList(){
    const el = document.getElementById('board-list'); el.innerHTML = '';
    // Try to fetch server-side persisted messages first
    (async ()=>{
      try{
        const endpoint = getBoardEndpoint();
        const res = await fetch(endpoint, { method: 'GET' });
        if(res.ok){
          const j = await res.json();
          if(j && Array.isArray(j.messages) && j.messages.length>0){
            j.messages.slice().reverse().forEach(item=> renderBoardCard(el, item));
            return;
          }
        }
      }catch(e){ /* server not available, fall back */ }
      // fallback to localStorage messages
      const list = loadBoardMessages();
      if(list.length===0){ el.innerHTML = '<div class="empty">还没有留言，快来发第一条！</div>'; return; }
      list.slice().reverse().forEach(item=> renderBoardCard(el, item));
    })();
  }

  document.getElementById('board-post').addEventListener('click', (ev)=>{
    ev.preventDefault();
    (async ()=>{
  const author = document.getElementById('board-author').value.trim();
  const text = document.getElementById('board-text').value.trim();
  if(!text){ alert('请输入留言内容'); return; }
  // No static-photo selection in board; plain text message
  const msg = { author: author || '匿名', text, photoUrl: null, ts: Date.now() };
      // Try to POST to server; if it fails, fall back to localStorage
      try{
        const endpoint = getBoardEndpoint();
        const res = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(msg) });
        if(res.ok){
          // clear inputs and refresh from server
          document.getElementById('board-text').value = '';
          renderList();
          return;
        }
      }catch(e){ /* network error -> fallback */ }
      // fallback: save locally
      const list = loadBoardMessages();
      list.push({ author: msg.author, text: msg.text, photoUrl: null, ts: msg.ts });
      saveBoardMessages(list);
      document.getElementById('board-text').value = '';
      // no photo select to clear
      renderList();
    })();
  });

  renderList();

  // bind board upload drag/drop and file input
  const dropArea = document.getElementById('board-drop-area');
  const boardFileElem = document.getElementById('board-fileElem');
  ['dragenter','dragover'].forEach(e=>dropArea.addEventListener(e,ev=>{ev.preventDefault();dropArea.classList.add('dragover')}));
  ['dragleave','drop'].forEach(e=>dropArea.addEventListener(e,ev=>{ev.preventDefault();dropArea.classList.remove('dragover')}));
  dropArea.addEventListener('drop', async (ev)=>{ try{ const files = Array.from(ev.dataTransfer.files); await handleBoardFiles(files); }catch(err){ console.error('board drop error', err); alert('上传失败'); } });
  boardFileElem.addEventListener('change', async (ev)=>{ try{ const files = Array.from(ev.target.files); await handleBoardFiles(files); boardFileElem.value=''; }catch(err){ console.error('board file error', err); alert('上传失败'); } });

  // Attempt a one-time initial sync of local->server (no periodic polling)
  try{
    await syncLocalBoardMessages();
  }catch(e){ console.warn('board sync init failed', e); }
}

// Sync any locally saved board messages (localStorage) to server. On success remove them locally.
async function syncLocalBoardMessages(){
  const endpoint = getBoardEndpoint();
  const local = loadBoardMessages();
  if(!Array.isArray(local) || local.length===0) return;
  const remaining = [];
  for(const item of local){
    try{
      const msg = { author: item.author || '匿名', text: item.text || '', photoUrl: item.photoUrl || (item.photo ? (getStaticPhotoPath() + '/' + item.photo) : null), ts: item.ts || Date.now() };
      const res = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(msg) });
      if(!res.ok){ throw new Error('server returned non-ok'); }
    }catch(e){
      remaining.push(item);
    }
  }
  if(remaining.length===0) localStorage.removeItem('board_messages');
  else saveBoardMessages(remaining);
}

function renderBoardCard(container, item){
  const card = document.createElement('div'); card.className = 'board-card';
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = (item.author||'匿名') + ' · ' + (new Date(item.ts)).toLocaleString();
  const body = document.createElement('div'); body.className = 'body'; body.textContent = item.text;
  card.appendChild(meta); card.appendChild(body);
  if(item.photo){
    const img = document.createElement('img'); img.src = getStaticPhotoPath() + '/' + item.photo; img.style.maxWidth='100%'; img.style.marginTop='8px';
    card.appendChild(img);
  } else if(item.photoUrl){
    const img = document.createElement('img'); img.src = item.photoUrl; img.style.maxWidth='100%'; img.style.marginTop='8px';
    img.onerror = function(){ this.alt='图片加载失败'; };
    card.appendChild(img);
  }
  container.appendChild(card);
}

// Handle files uploaded from board area: upload to remote endpoint, create board messages and save local image record
async function handleBoardFiles(files){
  for(const f of files){
    if(!f.type.startsWith('image/')) continue;
    let uploadedUrl = null;
    try{
  const fd = new FormData(); fd.append('file', f, f.name);
  const headers = {};
  if(window.UPLOAD_KEY) headers['x-upload-key'] = window.UPLOAD_KEY;
  const endpoint = (window.UPLOAD_ENDPOINT || UPLOAD_ENDPOINT || '').toString();
  const res = await fetch(endpoint, { method: 'POST', body: fd, headers });
      if(res.ok){ const j = await res.json(); if(j && j.url) uploadedUrl = j.url; }
    }catch(e){ console.error('board upload failed', e); }

    // Read current author/text from the board form so image+text can be posted together
    const authorInput = document.getElementById('board-author');
    const textInput = document.getElementById('board-text');
    const author = (authorInput && authorInput.value.trim()) ? authorInput.value.trim() : '匿名';
    const text = (textInput && textInput.value.trim()) ? textInput.value.trim() : '';

    // create board message and try to persist to server; fall back to localStorage
    const msg = { author, text, photoUrl: uploadedUrl || null, ts: Date.now() };
    try{
      const endpoint = getBoardEndpoint();
      const res = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(msg) });
      if(!res.ok) throw new Error('server returned non-ok');
    }catch(e){
      // fallback: save locally with same shape
      const list = loadBoardMessages();
      list.push({ author: msg.author, text: msg.text, photoUrl: msg.photoUrl, ts: msg.ts });
      saveBoardMessages(list);
    }

    // also store in images DB for consistency
    try{
      const blob = await f.slice();
      const rec = { filename: f.name, blob: blob, albumId: null, artistId: null, artistName:'', createdAt: Date.now(), desc:'', url: uploadedUrl };
      await DB.add('images', rec);
    }catch(e){ console.error('save image to DB failed', e); }
  }
  // refresh board view
  try{ await showBoard(); }catch(e){ console.error('refresh board after upload failed', e); }
}

// Try to delete a remote uploaded object given its public URL. Returns true if deleted.
async function remoteDeleteUrl(url){
  try{
    const u = new URL(url);
    const key = decodeURIComponent(u.pathname.replace('/uploads/',''));
    const delUrl = u.origin + '/uploads/' + encodeURIComponent(key);
    const headers = {};
    if(window.UPLOAD_KEY) headers['x-upload-key'] = window.UPLOAD_KEY;
    const res = await fetch(delUrl, { method: 'DELETE', headers });
    return res.ok;
  }catch(err){ console.error('remoteDeleteUrl error', err); return false; }
}

init();

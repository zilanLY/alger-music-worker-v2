const encoder = new TextEncoder();
const decoder = new TextDecoder();

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alger Music Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0c0c0c; min-height: 100vh; color: #fff; }
    .app { display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: linear-gradient(180deg, #1a1a1a 0%, #0c0c0c 100%); padding: 20px; border-bottom: 1px solid #222; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .logo { font-size: 20px; font-weight: 600; color: #e91e63; }
    .search-wrap { display: flex; align-items: center; background: #181818; border-radius: 20px; padding: 8px 16px; width: 300px; }
    .search-wrap input { background: transparent; border: none; color: #fff; flex: 1; font-size: 14px; outline: none; }
    .search-wrap input::placeholder { color: #666; }
    .nav { display: flex; gap: 24px; }
    .nav-item { color: #999; font-size: 14px; cursor: pointer; padding: 8px 0; }
    .nav-item.active { color: #e91e63; }
    .content { flex: 1; padding: 20px; max-width: 1200px; margin: 0 auto; width: 100%; }
    .section-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
    .playlist-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .playlist-item { background: #181818; border-radius: 8px; padding: 12px; cursor: pointer; transition: 0.2s; }
    .playlist-item:hover { background: #222; }
    .playlist-cover { width: 100%; aspect-ratio: 1; background: #222; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
    .playlist-cover img { width: 100%; height: 100%; object-fit: cover; }
    .playlist-name { font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .playlist-count { font-size: 12px; color: #666; }
    .song-table { width: 100%; }
    .song-row { display: grid; grid-template-columns: 60px 40px 1fr 1fr 80px; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; }
    .song-row:hover { background: #181818; }
    .song-row.playing { background: rgba(233,30,99,0.1); }
    .song-num { color: #666; }
    .song-title { font-size: 14px; }
    .song-artist { color: #999; font-size: 13px; }
    .song-album { color: #999; font-size: 13px; }
    .song-duration { color: #666; font-size: 13px; text-align: right; }
    .player-bar { background: #181818; border-top: 1px solid #222; padding: 12px 20px; display: flex; align-items: center; gap: 16px; }
    .player-cover { width: 50px; height: 50px; border-radius: 8px; background: #222; flex-shrink: 0; }
    .player-cover img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
    .player-info { flex: 1; min-width: 0; }
    .player-title { font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-artist { font-size: 12px; color: #999; }
    .player-controls { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .control-btns { display: flex; gap: 16px; align-items: center; }
    .control-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: 20px; }
    .control-btn.play { width: 36px; height: 36px; background: #e91e63; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .progress-wrap { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 600px; }
    .progress-time { font-size: 12px; color: #999; width: 40px; }
    .progress-bar { flex: 1; height: 4px; background: #333; border-radius: 2px; cursor: pointer; position: relative; }
    .progress-fill { height: 100%; background: #e91e63; border-radius: 2px; width: 0%; }
    .volume-wrap { display: flex; align-items: center; gap: 8px; }
    .volume-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; }
    .volume-bar { width: 80px; height: 4px; background: #333; border-radius: 2px; }
    .result-section { display: none; }
    .result-section.show { display: block; }
    .empty { text-align: center; padding: 40px; color: #666; }
  </style>
</head>
<body>
  <div class="app">
    <div class="header">
      <div class="header-top">
        <div class="logo">Alger Music</div>
        <div class="search-wrap">
          <input type="text" id="searchInput" placeholder="搜索音乐" onkeydown="if(event.key==='Enter')doSearch()">
        </div>
      </div>
      <div class="nav">
        <div class="nav-item active">发现音乐</div>
        <div class="nav-item">歌单</div>
        <div class="nav-item">歌手</div>
        <div class="nav-item">排行榜</div>
      </div>
    </div>
    <div class="content">
      <div class="section-title">热门歌单</div>
      <div class="playlist-grid" id="playlistGrid"></div>
      <div class="result-section" id="resultSection">
        <div class="section-title" id="resultTitle">搜索结果</div>
        <div id="songList"></div>
      </div>
    </div>
    <div class="player-bar">
      <div class="player-cover" id="playerCover"></div>
      <div class="player-info">
        <div class="player-title" id="playerTitle">未播放</div>
        <div class="player-artist" id="playerArtist">-</div>
      </div>
      <div class="player-controls">
        <div class="control-btns">
          <button class="control-btn">⏮</button>
          <button class="control-btn play" id="playBtn" onclick="togglePlay()">▶</button>
          <button class="control-btn">⏭</button>
        </div>
        <div class="progress-wrap">
          <span class="progress-time" id="currentTime">0:00</span>
          <div class="progress-bar" onclick="seekTo(event)">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <span class="progress-time" id="totalTime">0:00</span>
        </div>
      </div>
      <div class="volume-wrap">
        <button class="volume-btn" onclick="toggleMute()">🔊</button>
        <div class="volume-bar" onclick="setVolume(event)">
          <div class="progress-fill" id="volumeFill" style="width:70%"></div>
        </div>
      </div>
    </div>
  </div>
  <audio id="audioPlayer" style="display:none"></audio>
  <script>
    const audio = document.getElementById('audioPlayer');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerCover = document.getElementById('playerCover');
    const playBtn = document.getElementById('playBtn');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const progressFill = document.getElementById('progressFill');
    const volumeFill = document.getElementById('volumeFill');
    
    let isPlaying = false;
    let currentSong = null;
    
    audio.volume = 0.7;
    
    audio.ontimeupdate = function() {
      const pct = (audio.currentTime / audio.duration) * 100 || 0;
      progressFill.style.width = pct + '%';
      currentTimeEl.textContent = formatTime(audio.currentTime);
    };
    
    audio.onended = function() { playNext(); };
    
    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' + sec : sec);
    }
    
    function togglePlay() {
      if (!currentSong) return;
      if (isPlaying) audio.pause(); else audio.play();
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
    }
    
    function seekTo(e) {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    }
    
    function setVolume(e) {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.volume = pct;
      volumeFill.style.width = (pct * 100) + '%';
    }
    
    function toggleMute() {
      audio.muted = !audio.muted;
      volumeFill.style.width = audio.muted ? '0%' : (audio.volume * 100) + '%';
    }
    
    function loadPlaylist(id, name) {
      fetch('/api?type=playlist&server=netease&id=' + id)
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.tracks) renderSongs(d.result.tracks, name);
        });
    }
    
    function doSearch() {
      const kw = document.getElementById('searchInput').value.trim();
      if (!kw) return;
      fetch('/api?type=search&server=netease&s=' + encodeURIComponent(kw))
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.songs) renderSongs(d.result.songs, '搜索: ' + kw);
        });
    }
    
    function renderSongs(songs, title) {
      document.getElementById('resultSection').classList.add('show');
      document.getElementById('resultTitle').textContent = title || '搜索结果';
      document.getElementById('playlistGrid').style.display = 'none';
      const html = songs.map((s, i) => '<div class="song-row" onclick="playSong(' + s.id + ', ' + JSON.stringify(s).replace(/"/g, '&quot;') + ')"><span class="song-num">' + (i+1) + '</span><span class="song-title">' + s.name + '</span><span class="song-artist">' + (s.ar ? s.ar.map(a => a.name).join('/') : '') + '</span><span class="song-album">' + (s.al ? s.al.name : '') + '</span><span class="song-duration">-</span></div>').join('');
      document.getElementById('songList').innerHTML = html || '<div class="empty">暂无结果</div>';
    }
    
    function playSong(id, song) {
      currentSong = song;
      document.querySelectorAll('.song-row').forEach(r => r.classList.remove('playing'));
      event.target.closest('.song-row').classList.add('playing');
      fetch('/api?type=url&server=netease&id=' + id)
        .then(r => r.json())
        .then(d => {
          if (d.url) {
            audio.src = d.url;
            audio.play();
            isPlaying = true;
            playBtn.textContent = '⏸';
            playerTitle.textContent = song.name;
            playerArtist.textContent = song.ar ? song.ar.map(a => a.name).join('/') : '';
            playerCover.innerHTML = song.al && song.al.picUrl ? '<img src="' + song.al.picUrl + '">' : '';
          }
        });
    }
    
    function playNext() { console.log('next'); }
    
    (function() {
      const plists = [
        {id: 60198, name: '经典老歌'},
        {id: 5273083763, name: '纯音乐'},
        {id: 2829816513, name: '周杰伦'},
        {id: 5053641485, name: '林俊杰'},
        {id: 3135932023, name: '学习工作'}
      ];
      document.getElementById('playlistGrid').innerHTML = plists.map(p => '<div class="playlist-item" onclick="loadPlaylist(' + p.id + ', \\'' + p.name + '\\')"><div class="playlist-cover"></div><div class="playlist-name">' + p.name + '</div><div class="playlist-count">点击播放</div></div>').join('');
    })();
  </script>
</body>
</html>`;

const NETEASE_MODULUS = '157794750267131502212476817800345498121872783333389747424011531025366277535262539913701806290766479189477533597854989606803194253978660329941980786072432806427833685472618792592200595694346872951301770580765135349259590167490536138082469680638514416594216629258349130257685001248172188325316586707301643237607';
const NETEASE_PUBKEY = 65537n;
const NETEASE_NONCE = '0CoJUm6Qyw8W8jud';
const NETEASE_IV = '0102030405060708';
const DEFAULT_COOKIE = 'appver=8.2.30; os=iPhone OS; osver=15.0; EVNSM=1.0.0; buildver=2206; channel=distribution; machineid=iPhone13.3';
const DEFAULT_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CloudMusic/0.1.1 NeteaseMusic/8.2.30';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/api') {
      return handleApi(url);
    }
    return new Response(null, { status: 404 });
  },
};

async function handleApi(url) {
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id') || '';
  const s = url.searchParams.get('s') || '';

  try {
    if (type === 'search' && s) {
      const data = await callApi('/api/search/get', { s, type: 1, limit: 20 });
      return jsonResponse({ result: { songs: data.result?.songs || [] } });
    }
    if (type === 'playlist' && id) {
      const data = await callApi('/api/v3/playlist/detail', { id, n: 1000 });
      return jsonResponse({ result: { tracks: data.playlist?.tracks || [] } });
    }
    if (type === 'url' && id) {
      const data = await callApi('/api/song/enhance/player/url', { ids: [parseInt(id)], br: 320000 });
      return jsonResponse({ url: data.data?.[0]?.url || '' });
    }
    return jsonResponse({ error: 'Invalid request' }, 400);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

async function callApi(path, body) {
  const enc = await createBody(body);
  const res = await fetch('https://music.163.com/weapi' + path.replace('/api/', '/'), {
    method: 'POST',
    headers: {
      Referer: 'https://music.163.com/',
      Cookie: DEFAULT_COOKIE,
      'User-Agent': DEFAULT_UA,
      'X-Real-IP': randomIP(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(enc),
  });
  return res.json();
}

async function createBody(body) {
  const key = randomHex(16);
  const first = await encrypt(JSON.stringify(body), NETEASE_NONCE);
  const second = await encrypt(first, key);
  return { params: second, encSecKey: rsa(key) };
}

async function encrypt(text, key) {
  const ck = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'AES-CBC' }, false, ['encrypt']);
  const iv = encoder.encode(NETEASE_IV);
  const padded = pkcs7(encoder.encode(text), 16);
  const enc = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, ck, padded);
  return btoa(String.fromCharCode(...new Uint8Array(enc)));
}

function pkcs7(buf, size) {
  const pad = size - (buf.length % size) || size;
  const out = new Uint8Array(buf.length + pad);
  out.set(buf);
  out.fill(pad, buf.length);
  return out;
}

function randomHex(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return [...arr].map(b => b.toString(16).padStart(2,'0')).join('').slice(0,n);
}

function rsa(key) {
  const rev = key.split('').reverse().join('');
  const hex = [...rev].map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
  const enc = modPow(BigInt('0x' + hex), NETEASE_PUBKEY, BigInt(NETEASE_MODULUS));
  return enc.toString(16).padStart(256,'0');
}

function modPow(b, e, m) {
  let r = 1n, c = b % m;
  while (e > 0n) { if (e & 1n) r = (r * c) % m; c = (c * c) % m; e >>= 1n; }
  return r;
}

function randomIP() {
  const v = 1884815360 + Math.floor(Math.random() * 75000);
  return [(v>>24)&255, (v>>16)&255, (v>>8)&255, v&255].join('.');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
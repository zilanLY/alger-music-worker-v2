const encoder = new TextEncoder();
const decoder = new TextDecoder();

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alger Music Player Web</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #fff;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .header h1 {
      font-size: 2rem;
      background: linear-gradient(90deg, #e91e63, #ff4081);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .header p { color: #888; font-size: 0.9rem; }
    .search-box {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
      background: rgba(255,255,255,0.05);
      padding: 15px;
      border-radius: 15px;
    }
    .search-box input {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 15px;
    }
    .search-box input::placeholder { color: #666; }
    .search-box input:focus { outline: none; background: rgba(255,255,255,0.15); }
    .search-box button {
      padding: 12px 25px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #e91e63, #ff4081);
      color: #fff;
      font-size: 15px;
      cursor: pointer;
      transition: 0.3s;
    }
    .search-box button:hover { transform: scale(1.05); }
    .section {
      background: rgba(255,255,255,0.05);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.1rem;
      margin-bottom: 15px;
      color: #e91e63;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #e91e63, #ff4081);
      border-radius: 2px;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 10px; }
    .tag {
      padding: 8px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      cursor: pointer;
      transition: 0.2s;
      font-size: 0.9rem;
    }
    .tag:hover { background: linear-gradient(135deg, #e91e63, #ff4081); }
    .song-list { list-style: none; }
    .song-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-radius: 10px;
      cursor: pointer;
      transition: 0.2s;
      gap: 15px;
    }
    .song-item:hover { background: rgba(255,255,255,0.1); }
    .song-item.playing { background: rgba(233,30,99,0.2); border-left: 3px solid #e91e63; }
    .song-index { width: 25px; color: #666; font-size: 0.9rem; }
    .song-cover {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
      background: #222;
    }
    .song-info { flex: 1; min-width: 0; }
    .song-name {
      font-size: 0.95rem;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .song-artist { font-size: 0.8rem; color: #888; }
    .song-duration { color: #666; font-size: 0.85rem; }
    #player { margin-top: 20px; }
    .loading { text-align: center; padding: 30px; color: #888; }
    .error { text-align: center; padding: 30px; color: #e91e63; }
    .empty { text-align: center; padding: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Alger Music Player</h1>
      <p>Cloudflare Worker 部署 · 网易云音乐</p>
    </div>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索歌曲、歌手..." onkeydown="if(event.key==='Enter')search()">
      <button onclick="search()">搜索</button>
    </div>
    <div class="section">
      <div class="section-title">热门歌单</div>
      <div class="tags">
        <div class="tag" onclick="getPlaylist(60198)">经典老歌</div>
        <div class="tag" onclick="getPlaylist(5273083763)">纯音乐</div>
        <div class="tag" onclick="getPlaylist(2829816513)">周杰伦</div>
        <div class="tag" onclick="getPlaylist(5053641485)">林俊杰</div>
        <div class="tag" onclick="getPlaylist(2884045)">失眠夜</div>
        <div class="tag" onclick="getPlaylist(3135932023)">学习工作</div>
      </div>
    </div>
    <div class="section" id="resultSection" style="display:none;">
      <div class="section-title" id="resultTitle">搜索结果</div>
      <ul class="song-list" id="songList"></ul>
    </div>
    <div id="player"></div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js"></script>
  <script>
    const API_BASE = '';
    let ap = null;
    async function fetchAPI(path) {
      const res = await fetch(path);
      return await res.json();
    }
    async function search() {
      const keyword = document.getElementById('searchInput').value.trim();
      if (!keyword) return;
      showResult('搜索: ' + keyword);
      const data = await fetchAPI('/api?type=search&server=netease&s=' + encodeURIComponent(keyword));
      if (data && data.result && data.result.songs) renderSongs(data.result.songs);
    }
    async function getPlaylist(id) {
      showResult('歌单详情');
      const data = await fetchAPI('/api?type=playlist&server=netease&id=' + id);
      if (data && data.result && data.result.tracks) renderSongs(data.result.tracks.slice(0, 50));
    }
    function showResult(title) {
      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('resultTitle').textContent = title;
    }
    function renderSongs(songs) {
      const list = document.getElementById('songList');
      list.innerHTML = '';
      if (songs.length === 0) { list.innerHTML = '<li class="empty">暂无结果</li>'; return; }
      songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.onclick = () => playSong(song);
        const pic = (song.al && song.al.picUrl) || '';
        const artist = song.ar ? song.ar.map(a => a.name).join('/') : '未知';
        li.innerHTML = '<span class="song-index">' + String(index+1).padStart(2,'0') + '</span>' +
          '<img class="song-cover" src="' + pic + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23222%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22>♪</text></svg>\'">' +
          '<div class="song-info"><div class="song-name">' + song.name + '</div><div class="song-artist">' + artist + '</div></div>';
        list.appendChild(li);
      });
    }
    async function playSong(song) {
      document.querySelectorAll('.song-item').forEach(item => item.classList.remove('playing'));
      event.currentTarget.classList.add('playing');
      const data = await fetchAPI('/api?type=url&server=netease&id=' + song.id);
      let url = data.url || '';
      if (!url) { alert('无法播放该歌曲'); return; }
      const pic = (song.al && song.al.picUrl) || '';
      const artist = song.ar ? song.ar.map(a => a.name).join('/') : '未知';
      if (ap) ap.destroy();
      ap = new APlayer({
        container: document.getElementById('player'),
        theme: '#e91e63',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: 350,
        audio: [{ name: song.name, artist: artist, url: url, cover: pic }]
      });
    }
    new APlayer({ container: document.getElementById('player'), theme: '#e91e63', preload: 'auto', volume: 0.7, mutex: true, listFolded: false, listMaxHeight: 350, audio: [] });
  </script>
</body>
</html>`;

const NETEASE_MODULUS = '157794750267131502212476817800345498121872783333389747424011531025366277535262539913701806290766479189477533597854989606803194253978660329941980786072432806427833685472618792592200595694346872951301770580765135349259590167490536138082469680638514416594216629258349130257685001248172188325316586707301643237607';
const NETEASE_PUBKEY = 65537n;
const NETEASE_NONCE = '0CoJUm6Qyw8W8jud';
const NETEASE_IV = '0102030405060708';
const DEFAULT_NETEASE_COOKIE = 'appver=8.2.30; os=iPhone OS; osver=15.0; EVNSM=1.0.0; buildver=2206; channel=distribution; machineid=iPhone13.3';
const DEFAULT_NETEASE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CloudMusic/0.1.1 NeteaseMusic/8.2.30';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/api') {
      return handleApi(request, env);
    }
    return new Response(null, { status: 404 });
  },
};

async function handleApi(request, env) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const server = url.searchParams.get('server') || 'netease';
  const id = url.searchParams.get('id') || '';
  const s = url.searchParams.get('s') || '';
  const br = parseInt(url.searchParams.get('br')) || 320;

  try {
    if (type === 'search' && server === 'netease' && s) {
      const data = await neteaseSearch(s);
      return jsonResponse({ result: { songs: data } });
    }
    if (type === 'playlist' && server === 'netease' && id) {
      const data = await neteasePlaylist(id);
      return jsonResponse({ result: { tracks: data } });
    }
    if (type === 'url' && server === 'netease' && id) {
      const urlData = await neteaseUrl(id, br, env);
      return jsonResponse({ url: urlData.url });
    }
    if (type === 'song' && server === 'netease' && id) {
      const song = await neteaseSongDetail(id, env);
      return jsonResponse([{ title: song.name, author: song.artist.join('/'), url: '', pic: song.pic, lrc: '' }]);
    }
    return jsonResponse({ error: 'Invalid request' }, 400);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

async function neteaseSearch(keyword) {
  const data = await callNeteaseApi('/api/search/get', { s: keyword, type: 1, limit: 20 });
  if (!data.result || !data.result.songs) return [];
  return data.result.songs;
}

async function neteasePlaylist(id) {
  const data = await callNeteaseApi('/api/v3/playlist/detail', { id: id, n: 1000 });
  if (!data.playlist || !data.playlist.tracks) return [];
  return data.playlist.tracks;
}

async function neteaseSongDetail(id, env) {
  const data = await callNeteaseApi('/api/v3/song/detail/', { c: JSON.stringify([{ id: parseInt(id), v: 0 }]) }, env);
  if (!data.songs || !data.songs[0]) throw new Error('Song not found');
  const song = data.songs[0];
  let picId = song.al.pic_str || song.al.pic || '';
  if (song.al.picUrl) { const m = song.al.picUrl.match(/\/(\d+)\./); if (m) picId = m[1]; }
  return { name: song.name, artist: song.ar.map(a => a.name), pic: `https://p3.music.126.net/${neteaseEncryptId(picId)}/${picId}.jpg` };
}

async function neteaseUrl(id, br, env) {
  const data = await callNeteaseApi('/api/song/enhance/player/url', { ids: [parseInt(id)], br: br * 1000 }, env);
  const item = data.data && data.data[0];
  return { url: item ? item.url || '' : '' };
}

async function callNeteaseApi(pathname, body, env) {
  const encryptedBody = await createNeteaseBody(body);
  const response = await fetch(`https://music.163.com/weapi${pathname.replace('/api/', '/')}`, {
    method: 'POST',
    headers: createNeteaseHeaders(env),
    body: new URLSearchParams(encryptedBody).toString(),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

function createNeteaseHeaders(env) {
  return {
    Referer: 'https://music.163.com/',
    Cookie: env.NETEASE_COOKIE || DEFAULT_NETEASE_COOKIE,
    'User-Agent': DEFAULT_NETEASE_UA,
    'X-Real-IP': randomNeteaseIp(),
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

async function createNeteaseBody(body) {
  const secretKey = randomHex(16);
  const payload = JSON.stringify(body);
  const firstPass = await aesCbcEncryptBase64(payload, NETEASE_NONCE);
  const secondPass = await aesCbcEncryptBase64(firstPass, secretKey);
  return { params: secondPass, encSecKey: rsaEncryptSecretKey(secretKey) };
}

function randomHex(length) {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex.slice(0, length);
}

async function aesCbcEncryptBase64(text, keyText) {
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(keyText), { name: 'AES-CBC' }, false, ['encrypt']);
  const payload = pkcs7Pad(encoder.encode(text), 16);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: encoder.encode(NETEASE_IV) }, cryptoKey, payload);
  return bytesToBase64(new Uint8Array(encrypted));
}

function pkcs7Pad(bytes, blockSize) {
  const remainder = bytes.length % blockSize;
  const padding = remainder === 0 ? blockSize : blockSize - remainder;
  const output = new Uint8Array(bytes.length + padding);
  output.set(bytes);
  output.fill(padding, bytes.length);
  return output;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function rsaEncryptSecretKey(secretKey) {
  const reversed = secretKey.split('').reverse().join('');
  let hex = '';
  for (const char of reversed) hex += char.charCodeAt(0).toString(16).padStart(2, '0');
  const base = BigInt('0x' + hex);
  const encrypted = modPow(base, NETEASE_PUBKEY, BigInt(NETEASE_MODULUS));
  return encrypted.toString(16).padStart(256, '0');
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let current = base % modulus;
  let power = exponent;
  while (power > 0n) {
    if (power & 1n) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power >>= 1n;
  }
  return result;
}

function randomNeteaseIp() {
  const start = 1884815360, end = 1884890111;
  const value = start + Math.floor(Math.random() * (end - start + 1));
  return `${Math.floor(value / 16777216) % 256}.${Math.floor(value / 65536) % 256}.${Math.floor(value / 256) % 256}.${value % 256}`;
}

function neteaseEncryptId(id) {
  const magic = '3go8&$8*3*3h0k(2)2';
  const chars = String(id).split('');
  let mixed = '';
  for (let i = 0; i < chars.length; i++) {
    mixed += String.fromCharCode(chars[i].charCodeAt(0) ^ magic.charCodeAt(i % magic.length));
  }
  const digest = new Uint8Array(md5Binary(mixed));
  return bytesToBase64(digest).replace(/\//g, '_').replace(/\+/g, '-');
}

function md5Binary(input) {
  const message = binaryStringToBytes(input);
  const originalBitLength = message.length * 8;
  const withPaddingLength = (((message.length + 8) >> 6) + 1) << 6;
  const buffer = new Uint8Array(withPaddingLength);
  buffer.set(message);
  buffer[message.length] = 0x80;
  const dataView = new DataView(buffer.buffer);
  dataView.setUint32(buffer.length - 8, originalBitLength >>> 0, true);
  dataView.setUint32(buffer.length - 4, Math.floor(originalBitLength / 0x100000000), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const shifts = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const constants = Array.from({length: 64}, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0);
  for (let offset = 0; offset < buffer.length; offset += 64) {
    const words = new Uint32Array(16);
    for (let i = 0; i < 16; i++) words[i] = dataView.getUint32(offset + i * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const next = d; d = c; c = b;
      b = (b + leftRotate((a + f + constants[i] + words[g]) >>> 0, shifts[i])) >>> 0;
      a = next;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  const digest = new Uint8Array(16);
  new DataView(digest.buffer).setUint32(0, a0, true).setUint32(4, b0, true).setUint32(8, c0, true).setUint32(12, d0, true);
  return digest;
}

function leftRotate(value, amount) { return ((value << amount) | (value >>> (32 - amount))) >>> 0; }
function binaryStringToBytes(input) { const output = new Uint8Array(input.length); for (let i = 0; i < input.length; i++) output[i] = input.charCodeAt(i) & 0xff; return output; }

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
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
    :root { --primary: #e91e63; --bg-dark: #0c0c0c; --bg-light: #181818; --bg-lighter: #222; --text: #fff; --text-secondary: #999; --border: #2a2a2a; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-dark); color: var(--text); height: 100vh; overflow: hidden; }
    .app { display: flex; flex-direction: column; height: 100vh; }
    
    /* 顶部导航 */
    .header { height: 60px; background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 20px; flex-shrink: 0; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .logo { font-size: 22px; font-weight: 700; background: linear-gradient(90deg, #e91e63, #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; cursor: pointer; }
    .header-nav { display: flex; gap: 4px; }
    .nav-btn { padding: 8px 16px; color: var(--text-secondary); font-size: 14px; cursor: pointer; border-radius: 4px; transition: 0.2s; }
    .nav-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
    .nav-btn.active { color: var(--text); background: rgba(233,30,99,0.15); }
    .header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
    .search-box { display: flex; align-items: center; background: #252525; border-radius: 20px; padding: 6px 16px; width: 220px; border: 1px solid transparent; transition: 0.2s; }
    .search-box:focus-within { border-color: var(--primary); background: #1a1a1a; }
    .search-box input { background: transparent; border: none; color: var(--text); flex: 1; font-size: 13px; outline: none; }
    .search-box input::placeholder { color: #666; }
    .search-icon { color: #666; font-size: 14px; }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .header-btn { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; transition: 0.2s; }
    .header-btn:hover { color: var(--text); }
    .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #e91e63, #ff6b9d); cursor: pointer; }

    /* 主内容区 */
    .main { display: flex; flex: 1; overflow: hidden; }
    
    /* 左侧导航 */
    .sidebar { width: 200px; background: #141414; padding: 16px 0; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; }
    .sidebar-section { margin-bottom: 16px; }
    .sidebar-title { padding: 8px 20px; font-size: 12px; color: #666; text-transform: uppercase; }
    .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: 0.2s; }
    .sidebar-item:hover { color: var(--text); background: rgba(255,255,255,0.05); }
    .sidebar-item.active { color: var(--primary); background: rgba(233,30,99,0.1); }
    .sidebar-icon { font-size: 18px; width: 20px; text-align: center; }
    .sidebar-badge { margin-left: auto; background: var(--primary); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; }

    /* 内容区域 */
    .content { flex: 1; padding: 20px; overflow-y: auto; background: #0c0c0c; }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .content-title { font-size: 24px; font-weight: 600; }
    .content-tabs { display: flex; gap: 24px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
    .content-tab { padding: 12px 0; color: var(--text-secondary); font-size: 14px; cursor: pointer; border-bottom: 2px solid transparent; transition: 0.2s; }
    .content-tab:hover { color: var(--text); }
    .content-tab.active { color: var(--text); border-bottom-color: var(--primary); }

    /* 歌单网格 */
    .playlist-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .playlist-card { cursor: pointer; transition: 0.2s; }
    .playlist-card:hover { transform: translateY(-4px); }
    .playlist-cover { position: relative; aspect-ratio: 1; background: #1a1a1a; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .playlist-cover img { width: 100%; height: 100%; object-fit: cover; }
    .playlist-play-btn { position: absolute; right: 10px; bottom: 10px; width: 36px; height: 36px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; cursor: pointer; font-size: 14px; }
    .playlist-card:hover .playlist-play-btn { opacity: 1; }
    .playlist-name { font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .playlist-author { font-size: 12px; color: var(--text-secondary); }

    /* 歌曲列表 */
    .song-list { }
    .song-header { display: grid; grid-template-columns: 40px 40px 1fr 1fr 100px 80px; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; border-bottom: 1px solid var(--border); }
    .song-row { display: grid; grid-template-columns: 40px 40px 1fr 1fr 100px 80px; align-items: center; padding: 10px 16px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
    .song-row:hover { background: rgba(255,255,255,0.05); }
    .song-row.playing { background: rgba(233,30,99,0.1); }
    .song-row:hover .song-num { display: none; }
    .song-row:hover .song-play-icon { display: flex; }
    .song-num { color: var(--text-secondary); font-size: 14px; }
    .song-play-icon { display: none; color: var(--primary); font-size: 14px; }
    .song-title { display: flex; align-items: center; gap: 10px; }
    .song-title-img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
    .song-title-text { display: flex; flex-direction: column; }
    .song-name { font-size: 14px; }
    .song-album { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .song-artist { font-size: 13px; color: var(--text-secondary); }
    .song-duration { text-align: right; color: var(--text-secondary); font-size: 13px; }
    .song-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .song-action-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; transition: 0.2s; }
    .song-action-btn:hover { color: var(--text); }

    /* 底部播放栏 */
    .player-bar { height: 70px; background: #181818; border-top: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 16px; flex-shrink: 0; }
    .player-cover { width: 50px; height: 50px; border-radius: 6px; background: #222; flex-shrink: 0; cursor: pointer; overflow: hidden; }
    .player-cover img { width: 100%; height: 100%; object-fit: cover; }
    .player-info { width: 180px; flex-shrink: 0; }
    .player-title { font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .player-title:hover { color: var(--primary); }
    .player-artist { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .player-artist:hover { color: var(--text); }
    .player-controls { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; max-width: 700px; }
    .control-buttons { display: flex; align-items: center; gap: 16px; }
    .control-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 18px; transition: 0.2s; }
    .control-btn:hover { color: var(--text); }
    .control-btn.play { width: 36px; height: 36px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; }
    .control-btn.play:hover { transform: scale(1.05); background: #ff4081; }
    .progress-wrap { display: flex; align-items: center; gap: 8px; width: 100%; }
    .progress-time { font-size: 11px; color: #666; width: 35px; text-align: center; }
    .progress-bar { flex: 1; height: 4px; background: #333; border-radius: 2px; cursor: pointer; position: relative; }
    .progress-bar:hover { height: 6px; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 2px; width: 0%; transition: 0.1s; }
    .progress-bar:hover .progress-fill { background: #ff4081; }
    .player-extra { display: flex; align-items: center; gap: 12px; width: 200px; justify-content: flex-end; flex-shrink: 0; }
    .extra-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 18px; transition: 0.2s; }
    .extra-btn:hover { color: var(--text); }
    .volume-wrap { display: flex; align-items: center; gap: 8px; }
    .volume-bar { width: 80px; height: 4px; background: #333; border-radius: 2px; cursor: pointer; }
    .volume-fill { height: 100%; background: var(--primary); border-radius: 2px; width: 70%; }

    /* 搜索结果 */
    .search-results { display: none; }
    .search-results.show { display: block; }
    .section-tabs { display: flex; gap: 20px; margin-bottom: 20px; }
    .section-tab { padding: 8px 16px; color: var(--text-secondary); font-size: 14px; cursor: pointer; border-radius: 20px; transition: 0.2s; }
    .section-tab:hover { background: rgba(255,255,255,0.1); }
    .section-tab.active { background: var(--primary); color: #fff; }

    /* 空状态 */
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 60px; color: #333; margin-bottom: 20px; }
    .empty-text { color: var(--text-secondary); font-size: 14px; }

    /* 滚动条 */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #444; }
  </style>
</head>
<body>
  <div class="app">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-left">
        <div class="logo">Alger Music</div>
        <div class="header-nav">
          <div class="nav-btn active">发现音乐</div>
          <div class="nav-btn">云音乐特性</div>
          <div class="nav-btn">关注</div>
        </div>
      </div>
      <div class="header-right">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="搜索音乐/歌手/歌词" onkeydown="if(event.key==='Enter')search()">
        </div>
        <div class="header-actions">
          <button class="header-btn">🔔</button>
          <button class="header-btn">⚙️</button>
          <div class="user-avatar"></div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">推荐</div>
          <div class="sidebar-item active"><span class="sidebar-icon">🎵</span>发现音乐</div>
          <div class="sidebar-item"><span class="sidebar-icon">📺</span>MV</div>
          <div class="sidebar-item"><span class="sidebar-icon">👥</span>朋友</div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">我的音乐</div>
          <div class="sidebar-item"><span class="sidebar-icon">❤️</span>我喜欢的音乐<span class="sidebar-badge">20</span></div>
          <div class="sidebar-item"><span class="sidebar-icon">📁</span>本地音乐</div>
          <div class="sidebar-item"><span class="sidebar-icon">📥</span>下载管理</div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-title">创建的歌单</div>
          <div class="sidebar-item"><span class="sidebar-icon">📋</span>我创建的歌单</div>
          <div class="sidebar-item"><span class="sidebar-icon">📋</span>收藏的歌单</div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content" id="contentArea">
        <div class="content-header">
          <h1 class="content-title">热门歌单</h1>
        </div>
        <div class="playlist-grid" id="playlistGrid"></div>
      </div>
    </div>

    <!-- 底部播放栏 -->
    <div class="player-bar">
      <div class="player-cover" id="playerCover"></div>
      <div class="player-info">
        <div class="player-title" id="playerTitle">未播放音乐</div>
        <div class="player-artist" id="playerArtist">点击播放</div>
      </div>
      <div class="player-controls">
        <div class="control-buttons">
          <button class="control-btn">🔀</button>
          <button class="control-btn">⏮</button>
          <button class="control-btn play" id="playBtn" onclick="togglePlay()">▶</button>
          <button class="control-btn">⏭</button>
          <button class="control-btn">🔁</button>
        </div>
        <div class="progress-wrap">
          <span class="progress-time" id="currentTime">0:00</span>
          <div class="progress-bar" onclick="seek(event)">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <span class="progress-time" id="totalTime">0:00</span>
        </div>
      </div>
      <div class="player-extra">
        <button class="extra-btn">📄</button>
        <button class="extra-btn">🔊</button>
        <div class="volume-wrap">
          <button class="extra-btn" onclick="toggleMute()">🔊</button>
          <div class="volume-bar" onclick="setVolume(event)">
            <div class="volume-fill" id="volumeFill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <audio id="audio" style="display:none"></audio>

  <script>
    const audio = document.getElementById('audio');
    let currentSong = null;
    let isPlaying = false;
    
    audio.volume = 0.7;
    
    audio.ontimeupdate = function() {
      if (audio.duration) {
        document.getElementById('progressFill').style.width = (audio.currentTime / audio.duration * 100) + '%';
        document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
      }
    };
    audio.onloadedmetadata = function() {
      document.getElementById('totalTime').textContent = formatTime(audio.duration);
    };
    audio.onended = function() { nextSong(); };
    
    function formatTime(s) {
      if (!s) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' + sec : sec);
    }
    
    function togglePlay() {
      if (!currentSong) return;
      if (isPlaying) audio.pause(); else audio.play();
      isPlaying = !isPlaying;
      document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
    }
    
    function seek(e) {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audio.duration) audio.currentTime = pct * audio.duration;
    }
    
    function setVolume(e) {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.volume = pct;
      document.getElementById('volumeFill').style.width = (pct * 100) + '%';
    }
    
    function toggleMute() {
      audio.muted = !audio.muted;
      document.getElementById('volumeFill').style.width = audio.muted ? '0%' : (audio.volume * 100) + '%';
    }
    
    function search() {
      const kw = document.querySelector('.search-box input').value.trim();
      if (!kw) return;
      fetch('/api?type=search&s=' + encodeURIComponent(kw))
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.songs) showSongs(d.result.songs, '搜索: ' + kw);
        });
    }
    
    function loadPlaylist(id, name) {
      document.getElementById('contentArea').innerHTML = '<h1 class="content-title">' + name + '</h1><div class="section-tabs"><div class="section-tab active">歌曲</div><div class="section-tab">评论</div><div class="section-tab">收藏者</div></div><div class="song-list" id="songList"></div>';
      fetch('/api?type=playlist&id=' + id)
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.tracks) renderSongList(d.result.tracks);
        });
    }
    
    function showSongs(songs, title) {
      document.getElementById('contentArea').innerHTML = '<h1 class="content-title">' + title + '</h1><div class="section-tabs"><div class="section-tab active">歌曲</div><div class="section-tab">歌手</div><div class="section-tab">专辑</div></div><div class="song-list" id="songList"></div>';
      renderSongList(songs);
    }
    
    function renderSongList(songs) {
      if (!songs || songs.length === 0) {
        document.getElementById('songList').innerHTML = '<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-text">暂无音乐</div></div>';
        return;
      }
      var html = '<div class="song-header"><span></span><span></span><span>音乐标题</span><span>歌手</span><span>专辑</span><span>时长</span></div>';
      songs.forEach(function(s, i) {
        var artist = s.ar ? s.ar.map(function(a) { return a.name; }).join('/') : '';
        var album = s.al ? s.al.name : '';
        var pic = s.al && s.al.picUrl ? s.al.picUrl : '';
        html += '<div class="song-row" onclick="playSong(' + s.id + ', this, ' + JSON.stringify(s).replace(/"/g, '&quot;') + ')"><span class="song-num">' + (i+1) + '</span><span class="song-play-icon">▶</span><div class="song-title"><img class="song-title-img" src="' + pic + '"><div class="song-title-text"><div class="song-name">' + s.name + '</div></div></div><span class="song-artist">' + artist + '</span><span class="song-album">' + album + '</span><span class="song-duration">-</span><div class="song-actions"><button class="song-action-btn">➕</button><button class="song-action-btn">❤️</button></div></div>';
      });
      document.getElementById('songList').innerHTML = html;
    }
    
    function playSong(id, row, song) {
      document.querySelectorAll('.song-row').forEach(function(r) { r.classList.remove('playing'); });
      row.classList.add('playing');
      fetch('/api?type=url&id=' + id)
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.url) {
            audio.src = d.url;
            audio.play();
            isPlaying = true;
            document.getElementById('playBtn').textContent = '⏸';
            document.getElementById('playerTitle').textContent = song.name;
            var artist = song.ar ? song.ar.map(function(a) { return a.name; }).join('/') : '';
            document.getElementById('playerArtist').textContent = artist;
            var pic = song.al && song.al.picUrl ? song.al.picUrl : '';
            document.getElementById('playerCover').innerHTML = pic ? '<img src="' + pic + '">' : '';
            currentSong = song;
          }
        });
    }
    
    function nextSong() { console.log('next'); }
    
    (function() {
      var lists = [
        {id: 60198, name: '经典老歌', author: '热门'},
        {id: 5273083763, name: '纯音乐', author: '轻音乐'},
        {id: 2829816513, name: '周杰伦', author: '精选'},
        {id: 5053641485, name: '林俊杰', author: '精选'},
        {id: 3135932023, name: '学习工作', author: 'BGM'},
        {id: 2884045, name: '失眠夜', author: '助眠'},
        {id: 2250011882, name: '华语经典', author: '回味'},
        {id: 316213294, name: '流行音乐', author: '热门'},
        {id: 65384332, name: '私人雷达', author: '每日'},
        {id: 3102973292, name: '跑步音乐', author: '运动'}
      ];
      var html = '';
      lists.forEach(function(p) {
        html += '<div class="playlist-card" onclick="loadPlaylist(' + p.id + ', \\'' + p.name + '\\')"><div class="playlist-cover"><div class="playlist-play-btn">▶</div></div><div class="playlist-name">' + p.name + '</div><div class="playlist-author">' + p.author + '</div></div>';
      });
      document.getElementById('playlistGrid').innerHTML = html;
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
      const data = await callApi('/api/search/get', { s: s, type: 1, limit: 30 });
      return jsonResponse({ result: { songs: data.result ? data.result.songs : [] } });
    }
    if (type === 'playlist' && id) {
      const data = await callApi('/api/v3/playlist/detail', { id: id, n: 50 });
      return jsonResponse({ result: { tracks: data.playlist ? data.playlist.tracks : [] } });
    }
    if (type === 'url' && id) {
      const data = await callApi('/api/song/enhance/player/url', { ids: [parseInt(id)], br: 320000 });
      return jsonResponse({ url: data.data && data.data[0] ? data.data[0].url : '' });
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
  let bin = '';
  const bytes = new Uint8Array(enc);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
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
  let hex = '';
  for (let i = 0; i < n; i++) hex += arr[i].toString(16).padStart(2, '0');
  return hex;
}

function rsa(key) {
  const rev = key.split('').reverse().join('');
  let hex = '';
  for (let i = 0; i < rev.length; i++) hex += rev.charCodeAt(i).toString(16).padStart(2, '0');
  const enc = modPow(BigInt('0x' + hex), NETEASE_PUBKEY, BigInt(NETEASE_MODULUS));
  return enc.toString(16).padStart(256, '0');
}

function modPow(b, e, m) {
  let r = 1n, c = b % m;
  while (e > 0n) { if (e & 1n) r = (r * c) % m; c = (c * c) % m; e >>= 1n; }
  return r;
}

function randomIP() {
  const v = 1884815360 + Math.floor(Math.random() * 75000);
  return ((v >> 24) & 255) + '.' + ((v >> 16) & 255) + '.' + ((v >> 8) & 255) + '.' + (v & 255);
}

function jsonResponse(data, status) {
  status = status || 200;
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
const encoder = new TextEncoder();

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alger Music Player</title>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #22c55e;
      --bg-white: #ffffff;
      --bg-black: #0a0a0a;
      --bg-light: #f9fafb;
      --bg-dark: #111827;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --border: #e5e7eb;
    }
    .dark { --bg-white: #0a0a0a; --bg-light: #111827; --text-primary: #f9fafb; --text-secondary: #9ca3af; --border: #374151; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-white); color: var(--text-primary); height: 100vh; overflow: hidden; }
    .app { display: flex; flex-direction: column; height: 100vh; }
    
    /* Header */
    .header { height: 64px; background: var(--bg-white); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 16px; flex-shrink: 0; }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .logo-img { width: 32px; height: 32px; border-radius: 8px; }
    .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); }
    .tabs-track { display: inline-flex; align-items: center; height: 34px; background: var(--bg-light); border-radius: 9999px; padding: 3px; gap: 0; }
    .tab-slider-bg { position: absolute; height: calc(100% - 6px); border-radius: 9999px; background: var(--primary); box-shadow: 0 1px 6px rgba(34,197,94,0.35); pointer-events: none; transition: all 0.28s; }
    .tab-btn { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; border: none; background: transparent; cursor: pointer; white-space: nowrap; transition: color 0.2s; color: var(--text-secondary); }
    .tab-btn.active { color: #fff; }
    .tab-btn:not(.active):hover { color: var(--text-primary); }
    .header-center { flex: 1; }
    .search-wrap { display: flex; align-items: center; height: 34px; padding: 0 12px; border-radius: 9999px; border: 1.5px solid var(--border); background: var(--bg-light); transition: all 0.2s; }
    .search-wrap:focus-within { border-color: var(--primary); }
    .search-icon { color: var(--text-secondary); font-size: 14px; margin-right: 8px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 13px; color: var(--text-primary); width: 200px; }
    .search-input::placeholder { color: var(--text-secondary); }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .header-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9999px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 15px; cursor: pointer; transition: all 0.15s; }
    .header-btn:hover { color: var(--primary); border-color: var(--primary); }
    .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); cursor: pointer; }

    /* Main Layout */
    .main { display: flex; flex: 1; overflow: hidden; }
    
    /* Sidebar */
    .sidebar { width: 100px; display: flex; flex-direction: column; align-items: center; padding: 16px 8px; background: var(--bg-white); border-right: 1px solid var(--border); flex-shrink: 0; }
    .sidebar-logo { width: 40px; height: 40px; border-radius: 10px; margin-bottom: 20px; cursor: pointer; }
    .sidebar-menu { width: 100%; }
    .sidebar-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 8px; border-radius: 10px; color: var(--text-secondary); font-size: 11px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
    .sidebar-item:hover { background: var(--bg-light); color: var(--text-primary); }
    .sidebar-item.active { background: rgba(34,197,94,0.1); color: var(--primary); }
    .sidebar-icon { font-size: 22px; }

    /* Content */
    .content { flex: 1; overflow: hidden; background: var(--bg-white); }
    .content-scroll { height: 100%; overflow-y: auto; padding: 20px 40px 120px; }
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 20px; }
    
    /* Hero Section */
    .hero { display: flex; gap: 20px; margin-bottom: 30px; }
    .hero-left { width: 730px; height: 280px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; position: relative; overflow: hidden; }
    .hero-right { flex: 1; background: var(--bg-light); border-radius: 12px; padding: 20px; }
    .hero-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .hero-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .hero-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-white); border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .hero-item:hover { background: #f0fdf4; }
    .hero-item-num { font-size: 14px; font-weight: 700; color: var(--primary); width: 24px; }
    .hero-item-text { font-size: 13px; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Section */
    .section { margin-bottom: 30px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 20px; font-weight: 700; }
    .section-more { color: var(--text-secondary); font-size: 13px; cursor: pointer; }
    .section-more:hover { color: var(--primary); }

    /* Playlist Grid */
    .playlist-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
    .playlist-card { cursor: pointer; }
    .playlist-cover { position: relative; aspect-ratio: 1; background: var(--bg-light); border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
    .playlist-cover img { width: 100%; height: 100%; object-fit: cover; }
    .playlist-play { position: absolute; right: 10px; bottom: 10px; width: 36px; height: 36px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; opacity: 0; transition: 0.2s; cursor: pointer; }
    .playlist-card:hover .playlist-play { opacity: 1; }
    .playlist-name { font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .playlist-author { font-size: 12px; color: var(--text-secondary); }

    /* Song List */
    .song-header { display: grid; grid-template-columns: 50px 60px 1fr 1fr 100px 80px; padding: 12px 16px; color: var(--text-secondary); font-size: 12px; border-bottom: 1px solid var(--border); }
    .song-row { display: grid; grid-template-columns: 50px 60px 1fr 1fr 100px 80px; align-items: center; padding: 10px 16px; border-radius: 8px; transition: 0.2s; cursor: pointer; }
    .song-row:hover { background: var(--bg-light); }
    .song-row.playing { background: rgba(34,197,94,0.1); }
    .song-num { color: var(--text-secondary); font-size: 14px; }
    .song-play-icon { display: none; color: var(--primary); }
    .song-row:hover .song-num { display: none; }
    .song-row:hover .song-play-icon { display: block; }
    .song-title { display: flex; align-items: center; gap: 12px; }
    .song-img { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; background: var(--bg-light); }
    .song-name { font-size: 14px; }
    .song-artist { font-size: 12px; color: var(--text-secondary); }
    .song-album { font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .song-duration { text-align: right; color: var(--text-secondary); font-size: 13px; }

    /* Player Bar */
    .player-bar { height: 70px; background: var(--bg-light); border-top: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 16px; flex-shrink: 0; }
    .player-cover { width: 50px; height: 50px; border-radius: 8px; background: var(--bg-dark); flex-shrink: 0; cursor: pointer; overflow: hidden; }
    .player-cover img { width: 100%; height: 100%; object-fit: cover; }
    .player-info { width: 180px; flex-shrink: 0; }
    .player-title { font-size: 14px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .player-title:hover { color: var(--primary); }
    .player-artist { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .player-controls { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; max-width: 700px; }
    .control-buttons { display: flex; align-items: center; gap: 20px; }
    .control-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; transition: 0.2s; }
    .control-btn:hover { color: var(--text-primary); }
    .control-btn.play { width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; }
    .control-btn.play:hover { transform: scale(1.05); }
    .progress-wrap { display: flex; align-items: center; gap: 10px; width: 100%; }
    .progress-time { font-size: 11px; color: var(--text-secondary); width: 35px; text-align: center; }
    .progress-bar { flex: 1; height: 4px; background: #d1d5db; border-radius: 2px; cursor: pointer; position: relative; }
    .progress-bar:hover { height: 6px; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 2px; width: 0%; transition: 0.1s; }
    .player-extra { display: flex; align-items: center; gap: 12px; width: 200px; justify-content: flex-end; flex-shrink: 0; }
    .extra-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; transition: 0.2s; }
    .extra-btn:hover { color: var(--text-primary); }
    .volume-wrap { display: flex; align-items: center; gap: 8px; }
    .volume-bar { width: 80px; height: 4px; background: #d1d5db; border-radius: 2px; cursor: pointer; }
    .volume-fill { height: 100%; background: var(--primary); border-radius: 2px; width: 70%; }

    /* Empty */
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 48px; color: var(--text-secondary); margin-bottom: 16px; }
    .empty-text { color: var(--text-secondary); font-size: 14px; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

    /* Dark mode toggle */
    .dark .bg-white { background: #0a0a0a; }
  </style>
</head>
<body>
  <div class="app" id="app">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <img src="https://p3.music.126.net/pcU2pZ5zCx9LIl93a0dW5g==/109951165647003367.png" class="logo-img" alt="logo">
        <span class="logo-text">Alger Music</span>
      </div>
      <div class="header-center">
        <div class="search-wrap">
          <i class="ri-search-line search-icon"></i>
          <input type="text" class="search-input" placeholder="搜索音乐、歌手、歌词" onkeydown="if(event.key==='Enter')search()">
        </div>
      </div>
      <div class="header-right">
        <button class="header-btn"><i class="ri-notification-3-line"></i></button>
        <button class="header-btn"><i class="ri-settings-3-line"></i></button>
        <div class="user-avatar" onclick="toggleTheme()"></div>
      </div>
    </div>

    <!-- Main -->
    <div class="main">
      <!-- Sidebar -->
      <div class="sidebar">
        <img src="https://p3.music.126.net/pcU2pZ5zCx9LIl93a0dW5g==/109951165647003367.png" class="sidebar-logo" alt="logo">
        <div class="sidebar-menu">
          <div class="sidebar-item active" onclick="showPage('home')"><i class="sidebar-icon ri-home-4-fill"></i>发现音乐</div>
          <div class="sidebar-item" onclick="showPage('list')"><i class="sidebar-icon ri-play-list-2-fill"></i>歌单</div>
          <div class="sidebar-item" onclick="showPage('artist')"><i class="sidebar-icon ri-singer-fill"></i>歌手</div>
          <div class="sidebar-item" onclick="showPage('album')"><i class="sidebar-icon ri-album-fill"></i>专辑</div>
          <div class="sidebar-item" onclick="showPage('toplist')"><i class="sidebar-icon ri-bar-chart-grouped-fill"></i>排行榜</div>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="content-scroll" id="contentArea">
          <!-- Content will be loaded here -->
        </div>
      </div>
    </div>

    <!-- Player Bar -->
    <div class="player-bar">
      <div class="player-cover" id="playerCover"></div>
      <div class="player-info">
        <div class="player-title" id="playerTitle">未播放音乐</div>
        <div class="player-artist" id="playerArtist">点击播放</div>
      </div>
      <div class="player-controls">
        <div class="control-buttons">
          <button class="control-btn"><i class="ri-repeat-line"></i></button>
          <button class="control-btn"><i class="ri-skip-back-line"></i></button>
          <button class="control-btn play" id="playBtn" onclick="togglePlay()"><i class="ri-play-fill"></i></button>
          <button class="control-btn"><i class="ri-skip-forward-line"></i></button>
          <button class="control-btn"><i class="ri-shuffle-line"></i></button>
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
        <button class="extra-btn"><i class="ri-equalizer-line"></i></button>
        <button class="extra-btn"><i class="ri-heart-line"></i></button>
        <div class="volume-wrap">
          <button class="extra-btn" onclick="toggleMute()"><i class="ri-volume-up-line"></i></button>
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
    let isDark = false;
    
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
      document.getElementById('playBtn').innerHTML = isPlaying ? '<i class="ri-pause-fill"></i>' : '<i class="ri-play-fill"></i>';
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
    
    function toggleTheme() {
      isDark = !isDark;
      document.body.classList.toggle('dark', isDark);
    }
    
    function search() {
      const kw = document.querySelector('.search-input').value.trim();
      if (!kw) return;
      fetch('/api?type=search&s=' + encodeURIComponent(kw))
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.songs) showSearchResult(d.result.songs, kw);
        });
    }
    
    function showSearchResult(songs, kw) {
      const html = '<h1 class="page-title">搜索: ' + kw + '</h1><div class="song-list"><div class="song-header"><span></span><span></span><span>音乐标题</span><span>歌手</span><span>专辑</span><span>时长</span></div>' + 
        songs.map(function(s, i) {
          var artist = s.ar ? s.ar.map(function(a) { return a.name; }).join('/') : '';
          var album = s.al ? s.al.name : '';
          var pic = s.al && s.al.picUrl ? s.al.picUrl : '';
          return '<div class="song-row" onclick="playSong(' + s.id + ', this, ' + JSON.stringify(s).replace(/"/g, '&quot;') + ')"><span class="song-num">' + (i+1) + '</span><span class="song-play-icon"><i class="ri-play-fill"></i></span><div class="song-title"><img class="song-img" src="' + pic + '"><div class="song-name">' + s.name + '</div></div><span class="song-artist">' + artist + '</span><span class="song-album">' + album + '</span><span class="song-duration">-</span></div>';
        }).join('') + '</div>';
      document.getElementById('contentArea').innerHTML = html;
    }
    
    function loadPlaylist(id, name) {
      fetch('/api?type=playlist&id=' + id)
        .then(r => r.json())
        .then(d => {
          if (d.result && d.result.tracks) {
            const html = '<h1 class="page-title">' + name + '</h1><div class="song-list"><div class="song-header"><span></span><span></span><span>音乐标题</span><span>歌手</span><span>专辑</span><span>时长</span></div>' + 
              d.result.tracks.map(function(s, i) {
                var artist = s.ar ? s.ar.map(function(a) { return a.name; }).join('/') : '';
                var album = s.al ? s.al.name : '';
                var pic = s.al && s.al.picUrl ? s.al.picUrl : '';
                return '<div class="song-row" onclick="playSong(' + s.id + ', this, ' + JSON.stringify(s).replace(/"/g, '&quot;') + ')"><span class="song-num">' + (i+1) + '</span><span class="song-play-icon"><i class="ri-play-fill"></i></span><div class="song-title"><img class="song-img" src="' + pic + '"><div class="song-name">' + s.name + '</div></div><span class="song-artist">' + artist + '</span><span class="song-album">' + album + '</span><span class="song-duration">-</span></div>';
              }).join('') + '</div>';
            document.getElementById('contentArea').innerHTML = html;
          }
        });
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
            document.getElementById('playBtn').innerHTML = '<i class="ri-pause-fill"></i>';
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
    
    function showPage(page) {
      document.querySelectorAll('.sidebar-item').forEach(function(el) { el.classList.remove('active'); });
      event.target.closest('.sidebar-item').classList.add('active');
      loadHomePage();
    }
    
    function loadHomePage() {
      var lists = [
        {id: 60198, name: '经典老歌', author: '热门'},
        {id: 5273083763, name: '纯音乐', author: '轻音乐'},
        {id: 2829816513, name: '周杰伦', author: '精选'},
        {id: 5053641485, name: '林俊杰', author: '精选'},
        {id: 3135932023, name: '学习工作', author: 'BGM'},
        {id: 2884045, name: '失眠夜', author: '助眠'},
        {id: 316213294, name: '流行音乐', author: '热门'},
        {id: 65384332, name: '私人雷达', author: '每日'},
        {id: 3102973292, name: '跑步音乐', author: '运动'},
        {id: 2250011882, name: '华语经典', author: '回味'},
        {id: 316242296, name: '欧美金曲', author: '经典'},
        {id: 2809513713, name: '抖音热歌', author: '热门'}
      ];
      
      var html = '<div class="hero"><div class="hero-left"></div><div class="hero-right"><div class="hero-title">热门榜单</div><div class="hero-grid">' +
        lists.slice(0,6).map(function(p) { return '<div class="hero-item" onclick="loadPlaylist(' + p.id + ', \\'' + p.name + '\\')"><span class="hero-item-num">1</span><span class="hero-item-text">' + p.name + '</span></div>'; }).join('') + 
        '</div></div></div>';
      
      html += '<div class="section"><div class="section-header"><span class="section-title">推荐歌单</span><span class="section-more">查看更多 ></span></div><div class="playlist-grid">' +
        lists.map(function(p) { return '<div class="playlist-card" onclick="loadPlaylist(' + p.id + ', \\'' + p.name + '\\')"><div class="playlist-cover"><img src=""><div class="playlist-play"><i class="ri-play-fill"></i></div></div><div class="playlist-name">' + p.name + '</div><div class="playlist-author">' + p.author + '</div></div>'; }).join('') +
        '</div></div>';
      
      document.getElementById('contentArea').innerHTML = html;
    }
    
    loadHomePage();
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
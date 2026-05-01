const COOKIE_NETEASE = 'MUSIC_U=974764b914b88d2c8c46d4b81c1c4a7f5f8d0e3a; __csrf=dff8c9b6e3f8c9c46d4b81c1c4a7f5f8; NMTID=0123456789abcdef'; // User should replace with their own cookie

const DEFAULT_SERVER = 'netease';
const DEFAULT_BR = '320000';
const PICSIZE = '300';
const LRCTYPE = '0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function getCookie(server) {
  const envCookie = globalThis.NETEASE_COOKIE || COOKIE_NETEASE;
  if (server === 'netease') return envCookie;
  if (server === 'tencent') return globalThis.TENCENT_COOKIE || '';
  return '';
}

async function neteaseRequest(path, params = {}, cookie = '') {
  const defaultParams = {
   csrf: 'default_csrf',
  };
  const allParams = { ...defaultParams, ...params };
  
  const url = `https://music.163.com${path}`;
  const formData = new URLSearchParams();
  
  for (const [key, value] of Object.entries(allParams)) {
    formData.append(key, value);
  }
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com/',
    'Origin': 'https://music.163.com',
  };
  
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: headers,
      body: formData.toString(),
    });
    
    return await response.json();
  } catch (e) {
    console.error('Netease request error:', e);
    return { code: -1, msg: e.message };
  }
}

async function searchNetease(keyword, limit = 30, offset = 0, cookie = '') {
  const result = await neteaseRequest('/weapi/cloudsearch/get/web', {
    s: keyword,
    type: 1,
    limit,
    offset,
  }, cookie);
  
  if (result.code === 200 && result.result && result.result.songs) {
    return result.result.songs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => a.name).join(' / '),
      album: song.al.name,
      albumId: song.al.id,
      duration: song.dt,
      mv: song.mv,
    }));
  }
  return [];
}

async function getSongDetail(id, cookie = '') {
  const result = await neteaseRequest('/weapi/v3/song/detail', {
    ids: `[${id}]`,
  }, cookie);
  
  if (result.code === 200 && result.songs && result.songs[0]) {
    const song = result.songs[0];
    return {
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => a.name).join(' / '),
      artistId: song.ar.map(a => a.id).join(','),
      album: song.al.name,
      albumId: song.al.id,
      picUrl: song.al.picUrl,
      duration: song.dt,
    };
  }
  return null;
}

async function getSongUrl(id, br = '320000', cookie = '') {
  const levels = ['320000', '192000', '128000'];
  const targetBr = parseInt(br);
  
  for (const level of levels) {
    if (parseInt(level) <= targetBr) {
      const result = await neteaseRequest('/weapi/song/enhance/player/url/v1', {
        id,
        level: level === '320000' ? 'exhigh' : level === '192000' ? 'standard' : 'bass',
        encoding: 'aac',
      }, cookie);
      
      if (result.code === 200 && result.data && result.data[0] && result.data[0].url) {
        return {
          url: result.data[0].url,
          br: parseInt(level),
        };
      }
    }
  }
  
  return { url: null, br: 0 };
}

async function getLyric(id, cookie = '') {
  const result = await neteaseRequest('/weapi/song/lyric', {
    id,
    lv: '1',
    tv: '0',
  }, cookie);
  
  if (result.code === 200) {
    const lrc = result.lrc ? result.lrc.lyric : '';
    const tlrc = result.tlyric ? result.tlyric.lyric : '';
    return { lrc, tlrc };
  }
  return { lrc: '', tlrc: '' };
}

async function getAlbum(id, cookie = '') {
  const result = await neteaseRequest('/weapi/v1/album/' + id, {}, cookie);
  
  if (result.code === 200) {
    return {
      id: result.album.id,
      name: result.album.name,
      artist: result.album.artist.name,
      picUrl: result.album.picUrl,
      songs: result.songs.map(song => ({
        id: song.id,
        name: song.name,
        artist: song.ar.map(a => a.name).join(' / '),
        duration: song.dt,
      })),
    };
  }
  return null;
}

async function getPlaylist(id, cookie = '') {
  const result = await neteaseRequest('/weapi/v6/playlist/detail', {
    id,
    n: 1000,
  }, cookie);
  
  if (result.code === 200) {
    return {
      id: result.playlist.id,
      name: result.playlist.name,
      cover: result.playlist.coverImgUrl,
      description: result.playlist.description,
      creator: result.playlist.creator.nickname,
      tracks: result.playlist.tracks.map(song => ({
        id: song.id,
        name: song.name,
        artist: song.ar.map(a => a.name).join(' / '),
        album: song.al.name,
        duration: song.dt,
        picUrl: song.al.picUrl,
      })),
    };
  }
  return null;
}

async function getArtist(id, cookie = '') {
  const result = await neteaseRequest('/weapi/artist/top/song', {
    id,
  }, cookie);
  
  if (result.code === 200 && result.songs) {
    return {
      id,
      songs: result.songs.map(song => ({
        id: song.id,
        name: song.name,
        artist: song.ar.map(a => a.name).join(' / '),
        album: song.al.name,
        duration: song.dt,
      })),
    };
  }
  return null;
}

async function getToplist(cookie = '') {
  const result = await neteaseRequest('/weapi/toplist', {}, cookie);
  
  if (result.code === 200 && result.list) {
    return result.list.map(item => ({
      id: item.id,
      name: item.name,
      updateTime: item.updateTime,
    }));
  }
  return [];
}

async function getRecommend(cookie = '') {
  const result = await neteaseRequest('/weapi/v1/discovery/recommend/songs', {
    limit: 30,
    offset: 0,
  }, cookie);
  
  if (result.code === 200 && result.recommend) {
    return result.recommend.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.artists.map(a => a.name).join(' / '),
      album: song.album.name,
      picUrl: song.album.picUrl,
      duration: song.duration,
    }));
  }
  return [];
}

function transformToAlgerFormat(data, type, server) {
  if (type === 'song' && Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      name: item.name || item.songName || item.title,
      artist: item.artist || item.ar?.map(a => a.name).join(' / ') || item.author || item.artistName,
      artistId: item.artistId || item.ar?.[0]?.id || '',
      album: item.album || item.al?.name || item.albumName || '',
      albumId: item.albumId || item.al?.id || '',
      duration: item.duration || item.dt || 0,
      mv: item.mv || 0,
      picUrl: item.picUrl || item.al?.picUrl || item.cover || '',
    }));
  }
  return data;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\//, '/').replace(/^\/api$/, '/');
  
  const searchParams = url.searchParams;
  const server = searchParams.get('server') || searchParams.get('type')?.split('.')?.[0] || DEFAULT_SERVER;
  const type = searchParams.get('type') || searchParams.get('format') || 'song';
  const id = searchParams.get('id') || searchParams.get('ids') || '';
  const br = searchParams.get('br') || DEFAULT_BR;
  
  const cookie = getCookie(server);
  
  let result;
  const ext = type.split('.')[1] || type;
  
  try {
    switch (ext) {
      case 'search':
        const keyword = searchParams.get('keywords') || searchParams.get('keyword') || id;
        const limit = parseInt(searchParams.get('limit') || '30');
        const offset = parseInt(searchParams.get('offset') || '0');
        const searchResults = await searchNetease(keyword, limit, offset, cookie);
        result = transformToAlgerFormat(searchResults, 'song', server);
        break;
        
      case 'song':
        if (id.includes(',')) {
          const ids = id.split(',');
          const songs = await Promise.all(ids.map(async (songId) => {
            const detail = await getSongDetail(songId.trim(), cookie);
            if (detail) {
              const urlData = await getSongUrl(songId.trim(), br, cookie);
              return { ...detail, url: urlData.url };
            }
            return null;
          }));
          result = songs.filter(Boolean);
        } else {
          const detail = await getSongDetail(id, cookie);
          if (detail) {
            const urlData = await getSongUrl(id, br, cookie);
            result = [{ ...detail, url: urlData.url }];
          } else {
            result = [];
          }
        }
        break;
        
      case 'url':
        const urlData = await getSongUrl(id, br, cookie);
        if (urlData.url) {
          return Response.redirect(urlData.url, 302);
        }
        return new Response('{"error": "No URL available"}', {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
        
      case 'pic':
        const songDetail = await getSongDetail(id, cookie);
        if (songDetail && songDetail.picUrl) {
          return Response.redirect(songDetail.picUrl, 302);
        }
        return new Response('{"error": "No picture available"}', {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
        
      case 'lrc':
        const lyricData = await getLyric(id, cookie);
        return new Response(lyricData.lrc || '[00:00.00]No lyrics', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
        });
        
      case 'album':
        result = await getAlbum(id, cookie);
        break;
        
      case 'playlist':
        result = await getPlaylist(id, cookie);
        break;
        
      case 'artist':
        result = await getArtist(id, cookie);
        break;
        
      case 'toplist':
        result = await getToplist(cookie);
        break;
        
      case 'recommend':
        result = await getRecommend(cookie);
        break;
        
      default:
        const detail = await getSongDetail(id, cookie);
        if (detail) {
          const urlData = await getSongUrl(id, br, cookie);
          result = [{
            id: detail.id,
            name: detail.name,
            artist: detail.artist,
            album: detail.album,
            duration: detail.duration,
            url: urlData.url,
            pic: detail.picUrl,
          }];
        } else {
          result = [];
        }
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
    
  } catch (e) {
    console.error('Request error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    globalThis.NETEASE_COOKIE = env.NETEASE_COOKIE;
    globalThis.TENCENT_COOKIE = env.TENCENT_COOKIE;
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    return handleRequest(request);
  },
};
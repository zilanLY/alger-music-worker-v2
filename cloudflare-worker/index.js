const API_BASE = 'https://netease-cloud-music-api-five-roan-22.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/' || url.pathname === '/song') {
      const server = url.searchParams.get('server') || 'netease';
      const type = url.searchParams.get('type') || 'song';
      const id = url.searchParams.get('id');

      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      if (type === 'song') {
        return handleSong(server, id, url);
      } else if (type === 'url') {
        return handleUrl(server, id);
      } else if (type === 'pic') {
        return handlePic(server, id);
      } else if (type === 'lrc') {
        return handleLrc(server, id);
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  },
};

async function handleSong(server, id, url) {
  if (server !== 'netease') {
    return new Response(JSON.stringify({ error: 'Only netease is supported' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const detailRes = await fetch(`${API_BASE}/song/detail?ids=${id}`);
    const detailData = await detailRes.json();

    if (detailData.code !== 200 || !detailData.songs || !detailData.songs[0]) {
      return new Response(JSON.stringify({ error: 'Song not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const song = detailData.songs[0];
    const baseUrl = url.origin;

    return new Response(JSON.stringify([
      {
        title: song.name,
        author: song.ar.map(a => a.name).join('/'),
        url: `${baseUrl}/?server=netease&type=url&id=${id}`,
        pic: `${baseUrl}/?server=netease&type=pic&id=${id}`,
        lrc: `${baseUrl}/?server=netease&type=lrc&id=${id}`,
      },
    ]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function handleUrl(server, id) {
  if (server !== 'netease') {
    return new Response(JSON.stringify({ error: 'Only netease is supported' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const res = await fetch(`${API_BASE}/song/url?id=${id}`);
    const data = await res.json();

    if (data.code === 200 && data.data && data.data[0]) {
      const url = data.data[0].url;
      if (url) {
        return Response.redirect(url, 302);
      }
    }
    return new Response(JSON.stringify({ error: 'URL not available' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function handlePic(server, id) {
  if (server !== 'netease') {
    return new Response(JSON.stringify({ error: 'Only netease is supported' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const res = await fetch(`${API_BASE}/song/detail?ids=${id}`);
    const data = await res.json();

    if (data.code === 200 && data.songs && data.songs[0]) {
      const picUrl = data.songs[0].al.picUrl;
      if (picUrl) {
        return Response.redirect(picUrl, 302);
      }
    }
    return new Response(JSON.stringify({ error: 'Pic not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function handleLrc(server, id) {
  if (server !== 'netease') {
    return new Response(JSON.stringify({ error: 'Only netease is supported' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const res = await fetch(`${API_BASE}/lyric?id=${id}`);
    const data = await res.json();

    if (data.code === 200 && data.lrc) {
      return new Response(data.lrc.lyric || '', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }
    return new Response('[00:00.00]No lyrics available', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  } catch (e) {
    return new Response('[00:00.00]No lyrics available', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
}
# Alger Music Worker

基于 Cloudflare Worker 的网易云音乐 API + Web 播放器

## 项目结构

```
alger-music-worker/
├── cloudflare-worker/   # Cloudflare Worker 后端 API
│   ├── index.js         # Worker 主代码
│   └── wrangler.toml    # 配置文件
├── web/                 # Web 前端
│   └── index.html       # 播放器页面
└── README.md
```

## 部署 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建一个新的 Worker
3. 将 `cloudflare-worker/index.js` 的内容复制到 Worker 编辑器
4. 部署

或者使用 Wrangler CLI:

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

## 使用 API

部署后，你可以这样使用 API:

- 获取歌曲信息: `GET /?server=netease&type=song&id=28391863`
- 获取播放地址: `GET /?server=netease&type=url&id=28391863`
- 获取封面: `GET /?server=netease&type=pic&id=28391863`
- 获取歌词: `GET /?server=netease&type=lrc&id=28391863`

## Web 前端

将 `web/index.html` 部署到任何静态托管服务:

- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

## 配置自定义 API (AlgerMusicPlayer)

如果你想在 AlgerMusicPlayer 中使用这个 API，可以创建一个 JSON 配置文件:

```json
{
  "name": "Alger Music API",
  "apiUrl": "https://your-worker.workers.dev",
  "method": "GET",
  "params": {
    "server": "netease",
    "type": "url",
    "id": "{songId}"
  },
  "qualityMapping": {
    "higher": "128000",
    "exhigh": "320000",
    "lossless": "999000"
  },
  "responseUrlPath": "url"
}
```

然后在 AlgerMusicPlayer 设置中导入该配置文件。

## 注意事项

1. 此 API 使用公共网易云音乐接口，VIP 歌曲可能无法播放
2. 免费 Cloudflare Worker 每月有 100,000 次请求限制
3. 如需更高稳定性，建议配置自定义域名

## License

MIT
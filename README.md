# Alger Music Worker

基于 Cloudflare Worker 的原生网易云音乐 API (meting-workers)

## 项目结构

```
alger-music-worker/
├── cloudflare-worker/   # Cloudflare Worker 后端 API
│   ├── index.js         # Worker 主代码 (原生 meting-workers)
│   └── wrangler.toml    # 配置文件
├── web/                 # Web 前端
│   └── index.html       # 播放器页面
└── README.md
```

## 部署 Cloudflare Worker

### 方式一: 手动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建一个新的 Worker
3. 将 `cloudflare-worker/index.js` 的内容复制到 Worker 编辑器
4. 部署

### 方式二: 使用 Wrangler CLI

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

## API 使用

部署后，API 支持以下参数:

- `server`: 音乐平台 (`netease` / `tencent`)
- `type`: 操作类型 (`song` / `url` / `pic` / `lrc`)
- `id`: 歌曲 ID
- `br`: 音质 (24-999999 kbps)
- `picsize`: 封面尺寸
- `lrctype`: 歌词类型 (0=原文, 1=原文+翻译, 2=仅翻译)

### 示例

```
GET /?server=netease&type=song&id=28391863
GET /?server=netease&type=url&id=28391863&br=320
GET /?server=netease&type=pic&id=28391863&picsize=300
GET /?server=netease&type=lrc&id=28391863
```

## 环境变量配置

在 Cloudflare Worker 设置中添加以下环境变量:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SECRET_DOMAIN` | 允许访问的域名白名单 | (必填) |
| `DEFAULT_SERVER` | 默认音乐源 | `netease` |
| `DEFAULT_BR` | 默认音质(kbps) | `320` |
| `CACHE_MAX_AGE` | 缓存时间(秒) | `300` |
| `PICSIZE` | 封面尺寸 | `300` |
| `LRCTYPE` | 歌词模式 | `0` |
| `AUTH_ENABLED` | 开启鉴权 | `false` |
| `AUTH_SECRET` | 鉴权密钥 | - |
| `NETEASE_COOKIE` | 网易云 Cookie | 内置默认值 |
| `TENCENT_COOKIE` | QQ 音乐 Cookie | 内置默认值 |
| `DEBUG_ALLOW_ALL_REFERERS` | 调试模式 | `false` |

## 在 AlgerMusicPlayer 中使用

创建自定义 API 配置文件:

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

## License

MIT
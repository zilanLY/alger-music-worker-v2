# Alger Music Worker

基于 Cloudflare Worker 的 AlgerMusicPlayer Web 版，内置网易云音乐 API

## 一键部署

### 方式一：Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建新 Worker
3. 将 `index.js` 全部内容复制到 Worker 编辑器
4. 点击部署

### 方式二：Wrangler CLI

```bash
git clone https://github.com/zilanLY/alger-music-worker-v2.git
cd alger-music-worker-v2
wrangler deploy
```

## 使用方法

访问 Worker 域名即可使用播放器：

```
https://your-worker-name.workers.dev
```

功能：
- 🔍 搜索歌曲、歌手
- 🎵 播放歌曲（320kbps）
- 📋 热门歌单
- 🎨 简洁界面

## API 接口

| 端点 | 说明 |
|------|------|
| `/` | Web 播放器界面 |
| `/api?type=search&s=关键词` | 搜索歌曲 |
| `/api?type=playlist&id=歌单ID` | 获取歌单 |
| `/api?type=url&id=歌曲ID` | 获取播放地址 |

## 项目结构

```
alger-music-worker/
├── index.js       # Worker 主代码（API + 前端）
├── wrangler.toml  # 配置文件
└── README.md
```

## License

MIT
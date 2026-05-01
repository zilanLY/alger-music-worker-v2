# Alger Music Worker

基于 Cloudflare Workers 的音乐 API 服务，配合 AlgerMusicPlayer Web 版使用。

## 功能特性

- 🎵 支持网易云音乐、QQ 音乐歌曲解析
- 🔐 支持 VIP 歌曲解析（需要配置 Cookie）
- 🚀 基于 Cloudflare Workers 无服务器架构
- 💾 内置缓存机制
- 🎨 兼容 AlgerMusicPlayer 标准接口
- 🔄 支持自定义 API 和切换功能

## API 接口

### 搜索歌曲
```
GET /search?keywords=关键词&type=song&limit=30
```

### 获取歌曲详情
```
GET /song?id=歌曲ID
```

### 获取播放链接
```
GET /song/url?id=歌曲ID&br=320000
```

### 获取歌词
```
GET /lyric?id=歌曲ID
```

### 获取专辑
```
GET /album?id=专辑ID
```

### 获取歌单
```
GET /playlist?id=歌单ID
```

### 每日推荐
```
GET /recommend
```

### 榜单列表
```
GET /toplist
```

## 部署

### 方式一：手动部署

1. 安装 Wrangler
```bash
npm install -g wrangler
```

2. 登录 Cloudflare
```bash
wrangler login
```

3. 配置 secrets
```bash
wrangler secret put NETEASE_COOKIE
# 输入你的网易云 Cookie

wrangler secret put TENCENT_COOKIE  
# 输入你的 QQ 音乐 Cookie（可选）
```

4. 部署
```bash
wrangler deploy
```

### 方式二：GitHub Actions 自动部署

1. Fork 本项目
2. 在 Cloudflare Dashboard 创建 Workers
3. 在 GitHub 仓库设置中添加 Secrets:
   - `CF_API_TOKEN`: Cloudflare API Token
   - `CF_ACCOUNT_ID`: Cloudflare 账户 ID
   - `CF_ZONE_ID`: Cloudflare 域名 Zone ID
   - `NETEASE_COOKIE`: 网易云 Cookie（用于 VIP 歌曲）
   - `TENCENT_COOKIE`: QQ 音乐 Cookie（可选）

## 获取 Cookie

### 网易云音乐 Cookie
1. 登录网页版网易云音乐 (music.163.com)
2. 按 F12 打开开发者工具
3. 切换到 Application/Network 标签
4. 找到任意请求，复制 Cookie 头

### QQ 音乐 Cookie
1. 登录网页版 QQ 音乐 (y.qq.com)
2. 同样方式获取 Cookie

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DEFAULT_SERVER | 默认音乐源 | netease |
| DEFAULT_BR | 默认音质 | 320000 |
| PICSIZE | 封面尺寸 | 300 |
| LRCTYPE | 歌词类型 | 0 |

## Web 端使用

打开 `index.html`，在顶部选择 API：
- **Cloudflare Worker**: 使用本地部署的 Worker
- **公益API**: 使用公开的公益 API
- **自定义**: 输入自定义 API 地址

## VIP 歌曲解析

VIP 歌曲需要配置有效的 Cookie 才能解析。请确保：
1. Cookie 对应的账号有 VIP 会员
2. Cookie 未过期
3. 定期更新 Cookie

## 注意事项

- 本项目仅供学习交流，请支持正版音乐
- 请勿用于商业用途
- 网易云 Cookie 获取可能需要手机验证码登录
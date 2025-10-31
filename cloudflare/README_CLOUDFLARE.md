Cloudflare Pages + Worker + R2 — 快速部署指南

目标
- 使用 Cloudflare Worker 接收前端上传（field 名称：`file`），写入 R2，并返回一个公开可访问的 URL。
- Worker 同时支持 GET /uploads/<key> 以直接读取 R2 中的对象并返回（适合直接将返回的 URL 作为图片 src）。

主要文件
- `cloudflare/worker.js` — Worker 代码（处理 POST /upload、GET /uploads/:key、CORS、可选简单 auth）。
- `cloudflare/wrangler.toml` — 示例配置（更新为真实 bucket 名与变量）。

部署步骤（简洁版）
1. 注册并登录 Cloudflare。
2. 创建 R2 bucket（例如 `my-project-images`）。
3. 在本地安装 Wrangler（Cloudflare CLI）：
   - `npm install -g wrangler` 或 `npm install --save-dev wrangler`
   - `wrangler login`
4. 在 `cloudflare/wrangler.toml` 中更新：
   - `bucket_name` 改为你在 R2 控制台创建的 bucket 名。
   - 把 `UPLOAD_KEY` 替换为一个你选择的字符串（可选）。
   - 把 `ORIGIN_BASE` 设置为你的 Pages 或 Worker 的基础域名（例如 `https://your-site.pages.dev`）。
5. 部署：
   - `wrangler publish --env production`

注意事项
- R2 对象默认并不会直接通过域名公开（你通常需要通过 Worker/Pages 来代理或设置自定义域名的路由）。本示例的 Worker 同时实现了 GET /uploads/<key>，因此返回的 `publicUrl` 会是 Worker/Pages 的域名加 `/uploads/<key>`。
- 不要把 `UPLOAD_KEY` 当作真正的机密放在前端；若要在客户端直接上传，推荐实现短期签名或后端鉴权。Cloudflare 上可用 Workers 生成短期 token 的方式来做中间签名。
- 免费额度：Cloudflare 提供免费套餐，但 R2/Workers 的免费额度是有限的（请求数、存储量、出站流量等），请在生产使用前查看当前计费与配额。

如何配置前端 (index.html)
- 在 `js/app.js` 加载之前添加一段脚本，设置上传端点：
  ```html
  <script>
    // 请把 URL 替换为你部署后的 Worker 上传路径
    window.UPLOAD_ENDPOINT = 'https://your-pages-or-worker-domain/upload';
    // 如果使用了 UPLOAD_KEY 并且想在客户端带上（不安全，容易被抓取），可以设置：
    // window.UPLOAD_KEY = 'your_key_here';
  </script>
  ```

前端会把表单以 multipart/form-data POST 到 `window.UPLOAD_ENDPOINT`（field 名为 `file`）。Worker 返回 JSON `{ url }`，前端将该 `url` 写入 IndexedDB（`js/app.js` 已实现）。

示例安全改进建议
- 使用短期预签名：部署一个仅生成短期上传 token 的 Worker endpoint，客户端先向该 endpoint 请求 token，再用 token 上传（或直接返回一个预签名 URL）。
- 对上传大小/类型进行检查。
- 添加速率限制与审计日志以防滥用。

# 火山方舟视频生成部署说明

本项目通过服务端调用火山方舟，浏览器不会接触 API 密钥。

## 运行环境变量

- `ARK_API_KEY`：火山方舟 API Key，必须作为 Secret 保存。
- `ARK_VIDEO_MODEL_ID`：账号中已开通的 Seedance 模型 ID。
- `ARK_TEXT_MODEL_ID`：可选，启用火山方舟自动生成标题、摘要和核心解读；未配置时使用本地规则生成草稿。
- `ARK_BASE_URL`：可选，默认 `https://ark.cn-beijing.volces.com/api/v3`。

修改环境变量后需要重新部署已有版本才会生效。任何密钥都不得提交到 Git。

生产环境由轻量 Worker 处理 `/api/video/*`，其余请求交给静态资源服务，不在 Worker 中加载 React 服务端运行时。
外部请求的超时信号带有运行时兼容回退，避免托管 Worker 缺少 `AbortSignal.timeout` 时阻断火山方舟调用。
火山方舟请求使用 Worker 支持的手动重定向策略；任何非成功响应均按错误处理，不跟随未知跳转。

`/api/content/analyze` 支持粘贴文字、上传 TXT/MD 后的文本，以及公开 HTTPS 网页链接。链接抓取限制 1 MB、最多 3 次跳转，并拒绝本机、内网地址与非文本响应。

## 声音支持

生成请求默认传递 `generate_audio: true`，并在提示词中要求普通话旁白和低音量背景音乐。请使用支持原生音频的 Seedance 1.5 Pro 或 Seedance 2.0 模型；不支持音频的旧模型仍可能返回静音视频。

## 验证

运行 `npm test` 和 `npm run build`。真实生成测试还要求部署环境已配置有效密钥、模型权限和账户余额。

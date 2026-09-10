# 火山方舟视频生成部署说明

本项目通过服务端调用火山方舟，浏览器不会接触 API 密钥。

## 运行环境变量

- `ARK_API_KEY`：火山方舟 API Key，必须作为 Secret 保存。
- `ARK_VIDEO_MODEL_ID`：账号中已开通的 Seedance 模型 ID。
- `ARK_BASE_URL`：可选，默认 `https://ark.cn-beijing.volces.com/api/v3`。

修改环境变量后需要重新部署已有版本才会生效。任何密钥都不得提交到 Git。

## 验证

运行 `npm test` 和 `npm run build`。真实生成测试还要求部署环境已配置有效密钥、模型权限和账户余额。

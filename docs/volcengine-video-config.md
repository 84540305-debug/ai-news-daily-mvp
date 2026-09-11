# 火山方舟视频配置

网站的视频生成功能通过火山方舟 Contents Generations API 调用 Seedance。

## 生产环境变量

在托管平台配置以下变量，不要把真实 API Key 写入代码或提交到 Git：

```text
ARK_API_KEY=<火山方舟 API Key>
ARK_TEXT_MODEL_ID=doubao-seed-2-1-pro-260628
ARK_VIDEO_MODEL_ID=doubao-seedance-2-5-260628
```

当前视频模型使用 `Doubao-Seedance-2.5`。旧的
`doubao-seedance-1-5-pro-251215` 已停止接受调用，不应继续用于生产环境。
视频工作台支持生成 5 秒、10 秒或 30 秒样片。

## 验证流程

1. 运行 `npm test`，确认请求构造、任务提交和任务查询测试全部通过。
2. 运行 `npm run build`，确认前端与 Worker 构建成功。
3. 部署后打开 `/video-create`，页面应显示“火山方舟已连接”。
4. 只有在用户明确确认费用后才提交真实生成任务，且不得自动重复提交。


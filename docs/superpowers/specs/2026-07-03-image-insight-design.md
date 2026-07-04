# Image Insight Skill — 设计文档

> 日期: 2026-07-03 | 项目: xunse-v3 | 状态: 已确认

## 目标

做一个 Claude Code skill，调用阿里云通义千问 VL 模型识图，弥补 Claude 在 OCR（中文手写、复杂表格）和专业领域识别上的盲区。

## 能力范围

| 能力 | 描述 |
|------|------|
| 单图识图 | 本地路径或网络 URL → base64 → 千问 VL → 对话输出 |
| 任务定制 | `--task` 参数指定 OCR、翻译、分类等具体指令 |
| 模型选择 | `--model vl-max`（默认）/ `--model vl-plus`（轻量省钱）|
| 多图并行 | 一次传多个路径，并发请求 |
| 文件夹批量 | `--batch` 自动过滤图片格式，逐张处理 |

## API 配置

- **Endpoint**: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- **认证**: 读取环境变量 `DASHSCOPE_API_KEY`
- **模型**: `qwen-vl-max`（默认）/ `qwen-vl-plus`
- **格式**: OpenAI 兼容的 Chat Completions，图片以 base64 data URL 传入 `image_url`

## 调用方式

```bash
# 默认识图
/image-insight d:/screenshots/ui.png

# 指定任务
/image-insight d:/scan.png --task "OCR 这张中文手写笔记，保留原文格式"

# 多图并行
/image-insight d:/a.png d:/b.png

# 文件夹批量
/image-insight d:/screenshots/ --batch

# 换模型
/image-insight d:/img.png --model vl-plus
```

## 文件结构

```
.claude/skills/image-insight/
├── SKILL.md              # Skill 入口：触发规则 + 工作流
└── scripts/
    └── insight.mjs       # 核心脚本：参数解析、图片编码、API 调用、结果输出
```

## 输出

结果直接输出到对话中，不落盘。图多时每张图一段，前面标文件名。

## 错误处理

- `DASHSCOPE_API_KEY` 未设置 → 友好提示设置方法
- 文件不存在 → 报错并列出尝试的路径
- API 返回错误 → 打印千问返回的 error message
- 不支持的图片格式 → 跳过并提示

#!/usr/bin/env bash
set -euo pipefail

# HotKey Web 仓库验证脚本

required_files=(
  "README.md"
  "AGENTS.md"
  "next.config.ts"
  ".env.example"
  ".gitignore"
  "package.json"
  "tsconfig.json"
  "docs/README.md"
  "docs/TEMPLATE.md"
  "docs/prd"
  "docs/plans"
  "docs/design"
  "docs/acceptance"
  "docs/operations"
  ".codex/agents/builder.toml"
  ".codex/agents/explorer.toml"
  ".codex/agents/pm.toml"
  ".codex/agents/reporter.toml"
  ".codex/agents/tester.toml"
  ".codex/skills/commit/SKILL.md"
  ".codex/skills/pull/SKILL.md"
  ".codex/skills/push/SKILL.md"
  ".codex/skills/land/SKILL.md"
  ".github/pull_request_template.md"
)

echo "🔍 验证 hotkey-web 仓库结构..."

# 检查必需文件是否存在
for file in "${required_files[@]}"; do
  if [ -e "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file 不存在"
    exit 1
  fi
done

# 检查 Next.js 项目结构
echo ""
echo "🔍 检查 Next.js 项目结构..."
if [ -d "app" ]; then
  echo "✅ app 目录存在（Next.js App Router）"
else
  echo "⚠️  app 目录不存在"
fi

if [ -d "src" ]; then
  echo "✅ src 目录存在"
else
  echo "⚠️  src 目录不存在"
fi

echo ""
echo "✅ hotkey-web 仓库验证通过！"

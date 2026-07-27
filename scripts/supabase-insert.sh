#!/usr/bin/env bash
# Вставка строки через Supabase REST — ФОЛБЭК для скиллов в .claude/skills/.
# Основной путь — MCP-сервер supabase (mcp__supabase__execute_sql, insert ... values).
# Этот скрипт нужен, когда MCP не подключён в сессии.
# URL проекта и ключ лежат в scripts/supabase-env.sh, правь только там.
#
# Использование: scripts/supabase-insert.sh <таблица> <файл-с-json>
#   или JSON через stdin:  scripts/supabase-insert.sh <таблица> < body.json
#
# Пример (отчёт анализа):
#   scripts/supabase-insert.sh analysis_reports /tmp/report.json
#
# JSON длинный и содержит markdown с кавычками — пиши его в файл через Write,
# а не инлайном в командной строке: так не нужно экранировать содержимое.
set -euo pipefail

. "$(dirname "$0")/supabase-env.sh"

if [ $# -lt 1 ]; then
  echo "Ошибка: не указана таблица." >&2
  echo "Использование: $0 <таблица> <файл-с-json>" >&2
  exit 2
fi

table="$1"

if [ -n "${2:-}" ]; then
  if [ ! -f "$2" ]; then
    echo "Ошибка: файл с JSON не найден: $2" >&2
    exit 2
  fi
  body="$(cat "$2")"
else
  body="$(cat)"
fi

if [ -z "$body" ]; then
  echo "Ошибка: пустое тело запроса (ни файла, ни stdin)." >&2
  exit 2
fi

curl -sS --fail-with-body -X POST "${SUPABASE_URL}/rest/v1/${table}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$body"

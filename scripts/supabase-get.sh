#!/usr/bin/env bash
# Чтение записей из Supabase REST — ФОЛБЭК для скиллов в .claude/skills/.
# Основной путь к базе — MCP-сервер supabase (mcp__supabase__execute_sql).
# Этот скрипт нужен, когда MCP не подключён в сессии.
# URL проекта и ключ лежат в scripts/supabase-env.sh, правь только там.
#
# Использование: scripts/supabase-get.sh <таблица> [query-строка]
#   scripts/supabase-get.sh checklist_entries 'order=created_at.asc&limit=100'
#   scripts/supabase-get.sh gym_entries 'order=created_at.desc&limit=20'
#   scripts/supabase-get.sh analysis_reports 'order=report_date.asc&limit=200'
#
# Таблицы: checklist_entries, gym_entries, analysis_reports, gym_analysis_reports,
#          gym_set_log
set -euo pipefail

. "$(dirname "$0")/supabase-env.sh"

if [ $# -lt 1 ]; then
  echo "Ошибка: не указана таблица." >&2
  echo "Использование: $0 <таблица> [query-строка]" >&2
  echo "Пример: $0 checklist_entries 'order=created_at.asc&limit=100'" >&2
  exit 2
fi

table="$1"
query="${2:-order=created_at.asc&limit=100}"

curl -sS --fail-with-body "${SUPABASE_URL}/rest/v1/${table}?${query}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# Подключение к Supabase — единственное место в репозитории, где лежат
# URL проекта и publishable-ключ. Подключается через `source` из
# scripts/supabase-get.sh и scripts/supabase-insert.sh.
# Ключ publishable (анонимный, только чтение/вставка по RLS-политикам), не секретный.
# Меняется проект или ключ — правь только этот файл.
SUPABASE_URL="${SUPABASE_URL:-https://xfhduoighyjlxstvqhkc.supabase.co}"
SUPABASE_KEY="${SUPABASE_KEY:-sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP}"

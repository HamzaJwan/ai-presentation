#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/Appdata/ai_presentation"

echo "Preparing AI Presentation storage at: $APP_ROOT"

sudo mkdir -p "$APP_ROOT/appdata/content"
sudo mkdir -p "$APP_ROOT/appdata/media"
sudo mkdir -p "$APP_ROOT/backups"
sudo mkdir -p "$APP_ROOT/logs"
sudo mkdir -p "$APP_ROOT/exports"

# اجعل المجلدات مملوكة للمستخدم الحالي لتسهيل النسخ اليدوي
sudo chown -R "$USER":"$USER" "$APP_ROOT"

# صلاحيات آمنة وعملية
chmod -R 755 "$APP_ROOT"

echo "Done."
echo "Bind mount path:"
echo "$APP_ROOT/appdata:/app/data"

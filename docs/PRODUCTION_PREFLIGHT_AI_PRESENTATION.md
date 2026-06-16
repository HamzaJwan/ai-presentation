# Preflight قبل نشر AI Presentation

## فحص السيرفر

تأكد أن المنفذ `4561` غير مستخدم:

```bash
ss -tulpn | grep 4561
```

راجع الحاويات الحالية:

```bash
docker ps
```

تأكد من عدم وجود port conflict مع أي خدمة أخرى.

## فحص الصورة

جرّب سحب الصورة:

```bash
docker pull ghcr.io/hamzajwan/ai-presentation:latest
```

إذا كانت الصورة private، جهّز Registry auth في Portainer أو PAT بصلاحية `read:packages`.

## Portainer

في Stack variables:

```text
IMAGE_TAG=latest
APP_PORT=4561
WATCHTOWER_ENABLE=false
```

Compose path:

```text
deploy/portainer/stack.yml
```

## Cloudflare Tunnel

تأكد أن public hostname:

```text
ai.juanspace.org
```

يوجه إلى:

```text
http://172.31.1.70:4561
```

## فحص الأمان

- لا تعرض Portainer عبر tunnel.
- لا تضف Cloudflare tokens في Git.
- لا تضف `.env` حقيقي.
- تأكد أن public mode يخفي أدوات التحرير.
- استخدم Cloudflare Access إذا احتجت `?admin=1` من الإنترنت.

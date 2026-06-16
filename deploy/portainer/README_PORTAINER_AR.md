# نشر العرض عبر Portainer

## نوع التطبيق

- التطبيق Static React/Vite SPA.
- لا يوجد backend.
- لا توجد قاعدة بيانات.
- لا يوجد Redis.
- الملفات العامة والوسائط داخل `public/` وتدخل في Docker image.

## إعداد Stack من Git

في Portainer:

- Repository URL:

```text
https://github.com/HamzaJwan/ai-presentation.git
```

- Compose path:

```text
deploy/portainer/stack.yml
```

- Environment variables في واجهة Portainer:

```text
IMAGE_TAG=latest
APP_PORT=4561
WATCHTOWER_ENABLE=false
```

> ملاحظة: سلوك ملفات `.env` مع Portainer Git Stack قد يختلف حسب النسخة، لذلك الأفضل ضبط القيم من واجهة Portainer. الملف `.env.example` هنا للتوثيق فقط ولا يحتوي أسرارًا.

## صورة GHCR

الصورة الافتراضية:

```text
ghcr.io/hamzajwan/ai-presentation:latest
```

إذا كانت GHCR private، أضف Registry Authentication في Portainer باستخدام PAT لديه صلاحية:

```text
read:packages
```

إذا كانت Public، يمكن لـ Portainer السحب مباشرة.

## التحقق

بعد النشر:

```bash
docker ps
curl http://172.31.1.70:4561/healthz
```

يجب أن يرجع:

```text
ok
```

## ملاحظات أمنية

- لا تضع Cloudflare token داخل `stack.yml`.
- لا تنشر Portainer عبر نفس النفق.
- لا تضف أسرارًا داخل `public/config/site-config.json`.
- استخدم `?admin=1` فقط عند الحاجة، ويفضل حمايته عبر Cloudflare Access إذا كان متاحًا من الإنترنت.

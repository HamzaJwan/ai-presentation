# دليل النشر العربي — AI Workshop Presentation

## تشغيل محلي عادي

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:5173
```

## تشغيل محلي عبر Docker Desktop

```bash
docker compose -f docker-compose.local.yml up -d --build
```

افتح:

```text
http://localhost:4561
http://127.0.0.1:4561
```

Healthcheck:

```bash
curl http://127.0.0.1:4561/healthz
```

إيقاف:

```bash
docker compose -f docker-compose.local.yml down
```

## رفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "Prepare AI presentation web app for Docker deployment"
git branch -M main
git remote add origin https://github.com/HamzaJwan/ai-presentation.git
git push -u origin main
```

لا ترفع:

- `.env` حقيقي.
- Tokens.
- Passwords.
- Cloudflare tunnel token.
- Portainer credentials.
- صور تحتوي أسرارًا.

## GitHub Actions وGHCR

Workflow:

```text
.github/workflows/docker-ghcr.yml
```

يبني:

```text
ghcr.io/hamzajwan/ai-presentation:latest
ghcr.io/hamzajwan/ai-presentation:<commit-sha>
```

إذا كانت GHCR private، يحتاج Portainer registry auth أو PAT بصلاحية `read:packages`.

## Portainer

Stack repository:

```text
https://github.com/HamzaJwan/ai-presentation.git
```

Compose path:

```text
deploy/portainer/stack.yml
```

Variables:

```text
IMAGE_TAG=latest
APP_PORT=4561
WATCHTOWER_ENABLE=false
```

## Cloudflare Tunnel

Public hostname:

```text
ai.juanspace.org
```

Service:

```text
http://172.31.1.70:4561
```

إذا كان cloudflared داخل نفس Docker network:

```text
http://ai-presentation:80
```

لا تضع `CLOUDFLARE_TUNNEL_TOKEN` داخل Git.

## تغيير اسم المتحدث بدون rebuild

عدّل:

```text
public/config/site-config.json
```

أو استخدم query:

```text
?profile=engineer-officer
?profile=officer-only
?profile=general
```

القيم الحالية:

- `المقدم مهندس / حمزة عبدالله جوان`
- `المقدم / حمزة عبدالله جوان`
- `م. حمزة جوان`

## تغيير brand/logo

استخدم:

```text
?brand=waha
?brand=air-defense
?brand=generic
```

أو عدّل:

```text
public/config/site-config.json
```

ملفات اللوقو المقترحة:

```text
public/media/logo-waha.png
public/media/logo-air-defense.png
public/media/logo.png
```

## إضافة صور وفيديوهات للإنتاج

للإنتاج لا تعتمد على localStorage؛ ضع الملفات داخل:

```text
public/media/
```

أمثلة:

```text
public/media/slide-09-main.jpg
public/media/slide-10-main.jpg
public/media/slide-11-main.jpg
public/media/slide-09-main.mp4
```

ثم ابنِ image جديدًا.

## وضع الإدارة

الوضع العام يخفي أدوات التحرير. لعرضها مؤقتًا:

```text
?admin=1
```

إذا كان الرابط عامًا، استخدم Cloudflare Access قبل السماح باستخدام admin mode.
## أوضاع العرض

| الوضع | عدد الشرائح | الاستخدام |
| --- | ---: | --- |
| short | 22 | ساعة ضيقة / تدريب سريع |
| recommended | 25 | محاضرة ساعة مع ديمو |
| full | 31 | ورشة مطولة |

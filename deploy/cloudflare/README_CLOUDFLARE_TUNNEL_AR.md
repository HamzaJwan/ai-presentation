# Cloudflare Tunnel لعرض AI Presentation

الهدف:

```text
https://ai.juanspace.org
```

إلى التطبيق على السيرفر:

```text
http://172.31.1.70:4561
```

## الخيار A: Tunnel مُدار من لوحة Cloudflare

في Cloudflare Zero Trust:

- Public hostname:

```text
ai.juanspace.org
```

- Service:

```text
http://172.31.1.70:4561
```

Cloudflare يتولى HTTPS خارجيًا، والاتصال عبر tunnel مشفر إلى Cloudflare. يمكن أن يكون origin داخليًا HTTP.

## الخيار B: cloudflared container

استخدم:

```text
deploy/cloudflare/cloudflared-compose.example.yml
```

ولا تضع التوكن في Git. أضفه من Portainer UI أو Environment variables على السيرفر:

```text
CLOUDFLARE_TUNNEL_TOKEN=...
```

إذا كان `cloudflared` على نفس Docker network مع التطبيق، يمكن أن يكون الهدف:

```text
http://ai-presentation:80
```

إذا كان خارج الشبكة أو في Stack منفصل، استخدم:

```text
http://172.31.1.70:4561
```

## قواعد الأمان

- لا commit لأي `CLOUDFLARE_TUNNEL_TOKEN`.
- لا تعرض Docker socket.
- لا تعرض Portainer عبر هذا النفق.
- اعرض فقط تطبيق العرض static presentation.
- الوضع العام يخفي أدوات Media Manager وLogo Manager.
- إذا احتجت `?admin=1` عبر الإنترنت، فعّل Cloudflare Access قبل استخدامه.

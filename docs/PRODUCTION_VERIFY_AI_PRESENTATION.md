# Verify بعد نشر AI Presentation

## Portainer وDocker

تأكد أن Stack يعمل:

```bash
docker ps
docker inspect --format='{{json .State.Health}}' ai-presentation
```

اختبر healthcheck:

```bash
curl http://172.31.1.70:4561/healthz
```

يجب أن ترى:

```text
ok
```

## الاختبار الداخلي والخارجي

- افتح داخليًا: `http://172.31.1.70:4561`
- افتح خارجيًا: `https://ai.juanspace.org`

## تحقق العرض

- العربية RTL صحيحة.
- الصور تعمل.
- اللوقو يعمل إذا اخترت brand يحتوي `logoPath`.
- ديمو Wireless Link Budget يعمل.
- fullscreen يعمل.
- presenter mode يعمل محليًا.
- لا توجد أخطاء حرجة في Browser Console.

## تحقق profiles

افتح:

```text
?profile=engineer-officer
?profile=officer-only
?profile=general
```

وتأكد من تغيّر اسم المتحدث.

## تحقق brands

افتح:

```text
?brand=waha
?brand=air-defense
?brand=generic
```

وتأكد من تغيّر footer/logo حسب `public/config/site-config.json`.

## تحقق الوضع العام

بدون `?admin=1`:

- لا يظهر Media Manager.
- لا يظهر Logo Manager.
- لا تظهر أدوات تعديل الوسائط.

مع:

```text
?admin=1
```

تظهر أدوات التحرير عند الحاجة.

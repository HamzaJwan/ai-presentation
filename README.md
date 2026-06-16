# AI Workshop Web Presentation

عرض ويب عربي RTL لورشة الذكاء الاصطناعي من الفهم الأساسي إلى التطبيق العملي، مع وضع مقدم منفصل، شاشة جمهور، مدير وسائط، وديمو Wireless Link Budget.

## طريقة التشغيل

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:5173
```

لبناء نسخة إنتاجية:

```bash
npm run build
npm run preview
```

## التحكم أثناء العرض

- `Space` أو `ArrowRight`: التالي.
- `ArrowLeft`: السابق.
- `P`: فتح شاشة المقدم في نافذة منفصلة.
- `O`: عرض كل الشرائح.
- `M`: التبديل بين الوضع المختصر والكامل.
- `D`: الانتقال إلى الديمو.
- `F`: ملء الشاشة.

## إضافة صور يدويًا

ضع الصورة داخل:

```text
public/media/
```

واستخدم أسماء مثل:

```text
slide-09-main.jpg
slide-09-thumb-1.jpg
slide-10-main.jpg
slide-11-main.jpg
slide-12-main.jpg
```

النظام يحاول اكتشاف هذه الأسماء تلقائيًا. إذا أردت ربطًا ثابتًا، عدّل:

```text
src/data/mediaMap.js
```

## إضافة فيديو

ضع الفيديو داخل:

```text
public/media/
```

واستخدم أسماء مثل:

```text
slide-09-main.mp4
slide-10-main.webm
```

الفيديوهات داخل الشرائح تعمل `autoplay muted loop`، ويمكن تكبيرها بالضغط عليها.

## استخدام مدير الوسائط

داخل العرض اضغط زر:

```text
إدارة الوسائط
```

أو زر:

```text
اللوقو
```

ثم:

- اختر الشريحة من القائمة.
- اختر الفتحة: `main` أو `thumb-1` أو `thumb-2` أو `thumb-3` أو `logo`.
- اسحب صورة/فيديو أو اضغط للاختيار.
- اختر `cover` أو `contain`.
- اختر المحاذاة: `center` أو `top` أو `bottom` أو `left` أو `right`.
- عدّل التوهج وطبقة التعتيم.
- الحفظ يتم في `localStorage` مباشرة.

## إضافة لوقو

الطريقة الأولى:

- افتح `إدارة الوسائط`.
- اختر فتحة `logo` أو استخدم قسم إعدادات اللوقو.
- ارفع صورة اللوقو.
- اختر المكان: `top-right` أو `top-left` أو `bottom-right` أو `bottom-left`.
- اختر الحجم والشفافية.
- اختر الظهور: كل الشرائح، الغلاف فقط، أو إخفاء.

الطريقة الثانية:

ضع ملفًا باسم:

```text
public/media/logo.png
```

سيتم تحميله تلقائيًا إذا لم يوجد لوقو مخصص.

## العرض بشاشتين

أفضل متصفح: Chrome أو Edge.

الخطوات:

1. وصّل الشاشة الثانية أو البروجكتر.
2. افتح `http://localhost:5173`.
3. اضغط `P` لفتح شاشة المقدم.
4. من شاشة المقدم اضغط `فتح شاشة الجمهور`.
5. اسحب شاشة الجمهور إلى البروجكتر إذا لم تفتح هناك تلقائيًا.
6. اضغط زر ملء الشاشة داخل شاشة الجمهور أو اضغط `F`.
7. اترك شاشة المقدم أمامك لقراءة الملاحظات والتحكم.

شاشة المقدم تعرض:

- الشريحة الحالية.
- الشريحة التالية.
- ملاحظات المتحدث.
- المؤقت ورقم الشريحة.
- أزرار التالي والسابق.
- فتح شاشة الجمهور.
- طلب fullscreen للجمهور.
- تعتيم الجمهور.
- فتح مدير الوسائط واللوقو.

## الصور التي تم تنزيلها

تم تنزيل صور مرخصة أو عامة داخل:

```text
public/media/downloaded/
```

خريطة ربط الصور موجودة في:

```text
src/data/mediaMap.js
```

ملف الحقوق والمصادر:

```text
public/media/media-credits.json
```

خطة البحث والاستبدال:

```text
media-download-plan.md
```

لتنزيل الصور من قائمة المصادر مرة أخرى:

```bash
npm run download:media
```

القائمة القابلة للتعديل:

```text
scripts/media-sources.json
```

## ملاحظات مهمة

- الصور المرفوعة من الواجهة تحفظ في المتصفح، وهذا مناسب للصور الصغيرة.
- للفيديوهات الكبيرة استخدم مجلد `public/media`.
- المتصفح يمنع الدخول التلقائي إلى fullscreen بلا ضغطة من المستخدم، لذلك تظهر شاشة الجمهور زرًا واضحًا للدخول إلى ملء الشاشة.
- تراخيص صور Wikimedia موثقة داخل `public/media/media-credits.json`.

## النشر Docker / GitHub / Portainer

- دليل النشر العربي: `README_DEPLOYMENT_AR.md`.
- Stack الخاص بـ Portainer: `deploy/portainer/stack.yml`.
- Cloudflare Tunnel: `deploy/cloudflare/README_CLOUDFLARE_TUNNEL_AR.md`.
- إعدادات runtime بدون rebuild: `public/config/site-config.json`.
- الوضع العام يخفي أدوات التحرير، واستخدم `?admin=1` فقط عند الحاجة.

أوامر GitHub المقترحة:

```bash
git init
git add .
git commit -m "Prepare AI presentation web app for Docker deployment"
git branch -M main
git remote add origin https://github.com/HamzaJwan/ai-presentation.git
git push -u origin main
```

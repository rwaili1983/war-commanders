# تحديث استضافة WAR COMMANDERS إلى v0.13

1. فك ضغط `War_Commanders_v0.13_GitHub_Update_Kit.zip` على الهاتف أو الكمبيوتر.
2. ارفع `War_Commanders_v0.13_Render_Deploy.zip` إلى جذر المستودع `rwaili1983/war-commanders` على GitHub.
3. عدّل ملف `Dockerfile` في جذر المستودع ليحتوي على: `COPY War_Commanders_v0.13_Render_Deploy.zip /tmp/game.zip` بدل ملف الإصدار السابق.
4. احفظ التعديل على الفرع `main`، ثم راقب تبويب Events في لوحة Render الخاصة بالخدمة `war-commanders-demo`.
5. عند اكتمال النشر، افحص `https://war-commanders-demo.onrender.com/api/health`، ويجب أن تظهر القيمة `0.13.0`.
6. افتح الرابط نفسه في متصفحين، وأنشئ غرفة 1v1 أو 2v2، وتأكد من بقاء القوات البعيدة عن الرؤية مخفية لكل فريق.

لا تُحذف الخدمة الحالية. إذا تعذر النشر، راجع Build Logs أو استعد آخر Deploy ناجح من لوحة Render.
هذه الحزمة لا تضيف قاعدة بيانات دائمة؛ إعادة تشغيل الخادم تمسح الغرف النشطة.

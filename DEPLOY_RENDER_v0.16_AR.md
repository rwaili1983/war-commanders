# تحديث الخادم إلى قادة الحروب v0.16.0

1. افتح `War_Commanders_v0.16_GitHub_Update_Kit.zip` وفك ضغطه.
2. ارفع `War_Commanders_v0.16_Render_Deploy.zip` إلى جذر مستودع `rwaili1983/war-commanders` على فرع `main`، دون فك ضغط الملف الداخلي.
3. افتح Dockerfile في المستودع واستبدل سطر COPY بـ:
   `COPY War_Commanders_v0.16_Render_Deploy.zip /tmp/game.zip`
   أو ارفع Dockerfile الجديد بدلاً منه.
4. احفظ Commit ثم راقب آخر نشر من Render. إذا لم يبدأ النشر تلقائيًا، استخدم `Manual Deploy` > `Deploy latest commit`.
5. افتح `https://war-commanders-demo.onrender.com/api/health` وتأكد من أن `version` يساوي `0.16.0`.
6. افتح واجهة اللعبة في Safari على هاتفك. لإلغاء أثر ملفات الواجهة القديمة أعد تحميل الصفحة أو افتح تبويبًا خاصًا.

**هام:** الخدمة الحالية ستواصل تشغيل آخر إصدار منشور حتى يتم النشر الجديد. الغرف مؤقتة وتُمسح عند إعادة تشغيل الخادم؛ لا تطلق النشر أثناء مباراة حية.

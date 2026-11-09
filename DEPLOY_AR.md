# تحديث اللعبة المنشورة على Render من الآيفون

الخادم الحالي: https://war-commanders-demo.onrender.com
المستودع: https://github.com/rwaili1983/war-commanders

1. حمّل War_Commanders_v0.11_GitHub_Update_Kit.zip وافتحه في تطبيق الملفات على الآيفون.
2. من Safari افتح https://github.com/rwaili1983/war-commanders/upload/main وارفع الملف الداخلي War_Commanders_v0.11_Render_Deploy.zip فقط.
3. افتح https://github.com/rwaili1983/war-commanders/edit/main/Dockerfile وحدّث السطر `COPY War_Commanders_v0.8_Render_Deploy.zip /tmp/game.zip` أو أي اسم قديم إلى `COPY War_Commanders_v0.11_Render_Deploy.zip /tmp/game.zip`.
4. Commit changes؛ سيتولى Render النشر تلقائيًا إذا بقي autoDeploy مفعّلًا.
5. تحقق من https://war-commanders-demo.onrender.com/api/health وتأكد من أن version=0.11.0.

انتبه: لا تمسح ملف Dockerfile، ولا تفك ملف ZIP الداخلي.

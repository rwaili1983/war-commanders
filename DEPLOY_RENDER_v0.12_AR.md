# تحديث خادم Render إلى v0.12

1. فك `War_Commanders_v0.12_GitHub_Update_Kit.zip` على الآيفون.
2. افتح https://github.com/rwaili1983/war-commanders/upload/main في Safari.
3. ارفع معًا: `Dockerfile` و `War_Commanders_v0.12_Render_Deploy.zip` إلى جذر المستودع، مع تأكيد استبدال Dockerfile القديم.
4. اضغط Commit changes وانتقل إلى https://dashboard.render.com/web/srv-dbofan49v7es73f3qvig
5. راقب آخر عملية نشر. إذا لم تبدأ تلقائيًا، اختر Manual Deploy → Deploy latest commit مرة واحدة.
6. بعد Live افحص https://war-commanders-demo.onrender.com/api/health وتأكد من "version":"0.12.0".

تحذير: لا ترفع ملف ZIP الخارجي نفسه إلى Render؛ الملف الداخلي فقط.

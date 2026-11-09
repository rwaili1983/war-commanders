# تحديث خادم Render الحالي إلى v0.15

1. نزّل وفك ضغط `War_Commanders_v0.15_GitHub_Update_Kit.zip`.
2. ارفع ملف `War_Commanders_v0.15_Render_Deploy.zip` إلى جذر المستودع `rwaili1983/war-commanders` في فرع `main` (لا تفك ضغط هذا الملف الداخلي).
3. عدّل ملف Dockerfile الموجود مسبقًا بحيث يصبح سطر COPY:
   `COPY War_Commanders_v0.15_Render_Deploy.zip /tmp/game.zip`
   واحفظ Commit جديدًا. يمكنك استخدام ملف Dockerfile الموجود داخل الحزمة كمرجع أو استبداله بالكامل.
4. تابع حالة النشر في Render. إذا لم يبدأ التلقائي فاختر Manual Deploy ثم Deploy latest commit.
5. بعد ظهور Live افتح `https://war-commanders-demo.onrender.com/api/health` وتحقق من `version: 0.15.0`.
6. افتح اللعبة على هاتفين في نافذتين منفصلتين لتجربة غرفة 1v1. خوادم Render المجانية قد تدخل حالة خمول.

ملاحظة: مجموعات القوات تحفظ محليًا على جهاز اللاعب ولا تحتاج تغييرات في خادم المباريات، لكن يجب نشر ملفات `public` الجديدة بالكامل.

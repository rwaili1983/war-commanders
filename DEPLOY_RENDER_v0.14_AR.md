# رفع لعبة قادة الحروب v0.14 إلى الخادم الموجود

الخادم الحالي: `https://war-commanders-demo.onrender.com`
المستودع: `https://github.com/rwaili1983/war-commanders`

1. احتفظ بنسخة من الإصدار المنشور.
2. ارفع `War_Commanders_v0.14_Render_Deploy.zip` إلى **جذر** المستودع على GitHub، لا تفك ضغطه داخله.
3. عدّل ملف `Dockerfile` الموجود في الجذر ليكون مطابقًا للملف المرفق في حزمة GitHub (أو غيّر سطر COPY إلى `COPY War_Commanders_v0.14_Render_Deploy.zip /tmp/game.zip`).
4. احفظ تغييراتك في الفرع `main`، ثم تابع لوحة Render. إذا لم يبدأ النشر التلقائي، اختر Manual Deploy → Deploy latest commit.
5. بعد ظهور Live افتح `/api/health` وتحقق أن قيمة `version` تساوي `0.14.0`، ثم جرّب مباراة مع جهازين.

تنبيه: لا تستبدل الخدمة الحالية بخدمة جديدة. الغرف والجلسات على هذا الخادم مؤقتة وتُفقد أثناء إعادة النشر.

لإلغاء التحديث، ارجع إلى Dockerfile الخاص بالإصدار السابق ثم نفذ نشرًا جديدًا من GitHub.

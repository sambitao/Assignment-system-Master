
# Assignment Interruption System Pro

ระบบบริหารจัดการงานเทคนิคและการขัดข้องของโครงข่าย พร้อมระบบช่วยเหลือด้วย Gemini AI

## การเชื่อมต่อกับ GitLab CI/CD

เพื่อให้ระบบสามารถทำงานร่วมกับ GitLab และ Deploy อัตโนมัติ โปรดทำตามขั้นตอนนี้:

### 1. การตั้งค่า API Key
เนื่องจากแอปพลิเคชันนี้มีการใช้ Gemini API โปรดอย่าใส่ Key ลงในโค้ดโดยตรง ให้ทำตามนี้ใน GitLab:
1. ไปที่โปรเจกต์ของคุณใน **GitLab**
2. เลือก **Settings > CI/CD**
3. ขยายหัวข้อ **Variables**
4. กด **Add variable**
   - Key: `API_KEY`
   - Value: `[ใส่ Gemini API Key ของคุณที่นี่]`
   - เลือก **Mask variable** (เพื่อความปลอดภัย)
   - เลือก **Protect variable** (หากต้องการให้ใช้ได้เฉพาะ branch ที่ป้องกันไว้)

### 2. การ Deploy ไปยัง GitLab Pages
เมื่อคุณ Push โค้ดที่มีไฟล์ `.gitlab-ci.yml` ขึ้นไปยัง Branch `main` หรือ `master`:
- GitLab Runner จะทำงานโดยอัตโนมัติ
- เมื่อสถานะเป็น `passed` คุณสามารถดู URL ของเว็บได้ที่ **Deploy > Pages**

## การพัฒนาในเครื่อง (Local Development)
1. ติดตั้ง Dependencies: `npm install`
2. รันระบบ: `npm start` (หรือเปิด index.html ผ่าน Live Server)

---
© 2026 Senior Engineer Team | Powered by Gemini 3 Flash

# Sports Scoreboard Builder

เครื่องมือสร้างกรอบ Scoreboard แบบ PNG โปร่งใสสำหรับ OBS และงานถ่ายทอดสด ทำงานในเบราว์เซอร์และเก็บโปรเจกต์ไว้ในเครื่อง ไม่มี Backend และไม่ส่งโลโก้ไปยังบริการภายนอก

## ฟีเจอร์หลัก

- เลือกชนิดกีฬาก่อนเริ่ม: ฟุตบอล หรือ บาสเกตบอล
- โปรไฟล์กีฬาเลือก Template, สัดส่วน, สี, Style และ Module ให้เหมาะสมอัตโนมัติ
- วิเคราะห์สีจากโลโก้แบบ deterministic รักษา Aspect Ratio และปรับ Contrast ตาม WCAG
- Template Gallery, Undo/Redo, Snap Module 4px และ Reset ตำแหน่ง Module
- Autosave ใน LocalStorage พร้อม fallback เมื่อพื้นที่เก็บข้อมูลเต็ม
- ตั้งชื่อและเก็บ Snapshot โปรเจกต์ได้สูงสุด 20 โปรเจกต์
- Export PNG โปร่งใสแบบ Fit, OBS HD 1280×720 และ Full HD 1920×1080 ที่ 1×/2×/3×
- Export JSON/Import JSON พร้อม migration สำหรับไฟล์รุ่นเก่า

## เริ่มใช้งาน

```powershell
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง จากนั้นเลือกกีฬา อัปโหลดโลโก้ และปรับแต่งตามขั้นตอนด้านซ้าย

## คำสั่งตรวจสอบ

```powershell
npm run lint
npm run build
npm test
npm run test:e2e
```

`test:e2e` ใช้ Playwright และจะเปิด Vite server อัตโนมัติ หากเครื่องยังไม่มี Chromium ให้รัน `npx playwright install chromium`

## Workflow ที่แนะนำสำหรับ OBS

1. เลือกกีฬาและอัปโหลดโลโก้รายการ
2. ไปที่ Modules เปิดเฉพาะไอคอนที่ต้องการ และใช้ Snap เพื่อจัดแนว
3. ไปที่ Export เลือก `Fit to Scoreboard` หากจะวางทับบน Canvas ของ OBS หรือ `OBS HD 1280×720`/`Full HD Canvas` หากต้องการไฟล์เต็มฉาก
4. เปิด PNG ที่ได้ใน OBS ด้วย `Image Source` และวางข้อมูลสดจาก Text/Browser Source แยกต่างหาก

ไฟล์ PNG ที่ Export จะไม่มีชื่อทีม คะแนน ตัวเลข เวลา หรือข้อความตัวอย่าง ตาม [docs/EXPORT_RULES.md](docs/EXPORT_RULES.md)

## โครงสร้างสำคัญ

- `src/sports/` โปรไฟล์ฟุตบอลและบาสเกตบอล
- `src/lib/paletteExtractor.ts` วิเคราะห์สีจากโลโก้
- `src/lib/themeEngine.ts` สร้างสีที่เข้ากันและตรวจ Contrast
- `src/lib/projectStorage.ts` JSON, Autosave และ Project Library
- `tests/e2e/` Browser smoke tests

โปรเจกต์นี้เป็น local-first และยังไม่มีการ deploy หรือระบบผู้ใช้หลายคน

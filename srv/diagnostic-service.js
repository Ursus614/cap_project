const cds = require('@sap/cds');
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// open() 브라우저 자동 실행: export 바깥에서 등록해야 정상 작동!
const openModule = require('open');
const open = openModule.default || openModule;

cds.on('listening', () => {
  console.log('✅ CDS 서버가 시작되었습니다. 브라우저를 엽니다...');
  open('http://localhost:4004/html/index.html');
});

module.exports = async function (srv) {
  const db = await cds.connect.to('db');
  const { SystemDiagnostic } = db.entities;

  const app = cds.app;
  app.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      const [header, ...rows] = jsonData;
      const areas = header.slice(1);
      const entries = [];

      for (const row of rows) {
        const systemType = row[0];
        for (let i = 1; i < row.length; i++) {
          entries.push({
            ID: cds.utils.uuid(),
            systemType,
            area: areas[i - 1],
            score: parseInt(row[i], 10)
          });
        }
      }
      
      console.log("📥 최종 INSERT entries 데이터:", JSON.stringify(entries, null, 2)); // 추가된 로그

      await DELETE.from(SystemDiagnostic);
      await INSERT.into(SystemDiagnostic).entries(entries);
      fs.unlinkSync(filePath);

      console.log('http://localhost:4004/odata/v4/DiagnosticService/Diagnostics');

      res.status(200).send('업로드 성공');
    } catch (err) {
      res.status(500).send('에러 발생: ' + err.message);
    }
  });
};

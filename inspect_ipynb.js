const https = require('https');
const options = {
  hostname: 'api.github.com',
  path: '/repos/iphysresearch/TOP250movie_douban/contents/data_cleaning%26feature_engineering/Filting.ipynb',
  headers: {
    'Accept': 'application/vnd.github.v3.raw',
    'User-Agent': 'node'
  }
};

let data = '';
https.get(options, (res) => {
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const nb = JSON.parse(data);
      const cells = nb.cells || [];
      for (const cell of cells) {
        if (cell.cell_type === 'code') {
          const src = cell.source.join ? cell.source.join('') : cell.source;
          // DB 관련 키워드가 있는 셀만 출력
          if (/import\s+sqlite|pd\.read_|\.to_sql|create_engine|cursor\.|execute\(|CREATE TABLE|INSERT INTO|SELECT.*FROM|DataFrame|\.columns|\.dtypes|Schema/i.test(src)) {
            console.log('===== CELL =====');
            console.log(src);
          }
        }
      }
    } catch(e) {
      console.error('Parse error:', e.message);
      // raw 응답 앞부분만 보기
      console.log('Raw response (first 2000 chars):', data.substring(0, 2000));
    }
  });
}).on('error', (e) => console.error(e));

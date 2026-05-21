const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.bewkjysjcqdmxyfralnb:rlaehdwns069@@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});
client.connect()
  .then(() => client.query('SELECT * FROM public."ComponentNodes"'))
  .then(res => {
    console.log(res.rows);
    return client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });

const handler = require('./api/ai.js');
const req = {
  method: 'POST',
  body: { landSize: '5', cropType: 'Wheat', soilType: 'Black', location: 'Pune', budget: '50000' },
  headers: {}
};
const res = {
  setHeader: () => {},
  status: function(code) { console.log('Status:', code); return this; },
  json: function(data) { console.log('JSON:', data); return this; },
  end: () => {}
};
handler(req, res).catch(console.error);

const crypto = require('crypto');

// Промокоды храним в памяти (при перезапуске очищается)
const promocodeStore = new Map();

function generatePromocode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let promocode = 'PROMO-';
  
  for (let i = 0; i < 8; i++) {
    promocode += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return promocode;
}

exports.handler = async (event, context) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // POST /netlify/functions/promocode-webhook
  if (event.httpMethod === 'POST' && event.path === '/netlify/functions/promocode-webhook') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { Mail, Name } = body;
      
      let promocode;
      do {
        promocode = generatePromocode();
      } while (promocodeStore.has(promocode));
      
      const promocodeData = {
        code: promocode,
        createdAt: new Date().toISOString(),
        used: false,
        email: Mail,
        name: Name
      };
      
      promocodeStore.set(promocode, promocodeData);
      
      console.log('✅ Промокод:', Mail, promocode);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          promocode: promocodeData.code,
          message: 'Промокод создан'
        })
      };
    } catch (error) {
      console.error('Ошибка:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
  // GET /netlify/functions/promocode-test
  if (event.httpMethod === 'GET' && event.path === '/netlify/functions/promocode-test') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify Functions работает!',
        promocode: generatePromocode()
      })
    };
  }
  
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not Found' })
  };
};

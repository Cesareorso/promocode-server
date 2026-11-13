const crypto = require('crypto');

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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { Mail, Name } = body;
      
      let promocode;
      do {
        promocode = generatePromocode();
      } while (promocodeStore.has(promocode));
      
      promocodeStore.set(promocode, {
        code: promocode,
        email: Mail,
        name: Name,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Промокод:', Mail, promocode);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          promocode: promocode
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Функция работает!',
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

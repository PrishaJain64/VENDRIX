if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function test(){
    await redis.set('key','hello world','EX',60);
    const value = await redis.get('key');

    console.log(value);
    await redis.disconnect();
}
test().catch(console.error);
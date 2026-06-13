import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const contactRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:contact',
    });
    
    console.log("Testing Upstash...");
    const limitRes = await contactRateLimiter.limit('127.0.0.1');
    console.log("Upstash result:", limitRes);
  } catch (err) {
    console.error("Upstash Error:", err);
  }
}

test();

import 'dotenv/config';
import { PinnacleClient } from 'rcs-js';

export const rcsClient = new PinnacleClient({
  apiKey: process.env.PINNACLE_API_KEY!,
});

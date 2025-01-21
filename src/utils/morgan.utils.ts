import { Request } from 'express';
import { config } from '../config/';

const LOCALHOST_IPV6 = '::1';
const LOCALHOST_IPV4_MAPPED = config.mappedIP;
const LOCALHOST_LABEL = 'localhost';

export function getCleanIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (typeof forwardedFor === 'string') {
    const firstIp = forwardedFor.split(',')[0].trim();
    return firstIp || 'Unknown IP';
  }

  if (typeof realIp === 'string') {
    return realIp;
  }

  const ip = req.socket.remoteAddress ?? 'Unknown IP';

  // Make localhost IPs more readable
  if (ip === LOCALHOST_IPV6 || ip === LOCALHOST_IPV4_MAPPED) {
    return LOCALHOST_LABEL;
  }

  // Handle IPv4 mapped to IPv6
  if (ip?.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip;
}

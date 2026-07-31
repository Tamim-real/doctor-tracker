import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized access');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
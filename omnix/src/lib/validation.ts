import { z } from 'zod';
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => {
  if (typeof window === 'undefined') {
    return html; // Handle server side if needed
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
};

export const sanitizeText = (text: string) => {
  return text.replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'));
};

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const validateEmail = (email: string) => {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.issues[0].message;
};

export const validatePassword = (password: string) => {
  const result = passwordSchema.safeParse(password);
  return result.success ? null : result.error.issues[0].message;
};

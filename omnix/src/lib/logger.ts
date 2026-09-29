import { supabase } from './supabase';

type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: any;
  timestamp: string;
  environment: 'development' | 'production';
  url?: string;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  
  private constructor() {}

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: any) {
    const isDev = import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV !== 'production';
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: isDev ? 'development' : 'production',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };
    
    this.logs.push(entry);
    
    if (isDev) {
      // Developer logs (console)
      if (level === 'error' || level === 'fatal') {
        const msg = String(message || '');
        const ctxStr = typeof context === 'string' ? context : (context?.message || JSON.stringify(context || ''));
        if (msg.includes('Failed to fetch') || ctxStr.includes('Failed to fetch') || msg.includes('fetch failed') || ctxStr.includes('fetch failed')) {
          console.warn(`[NETWORK-OFFLINE] ${message}`, context || '');
          return;
        }
        console.error(`[${level.toUpperCase()}] ${message}`, context || '');
      } else if (level === 'warn') {
        console.warn(`[${level.toUpperCase()}] ${message}`, context || '');
      } else {
        console.log(`[${level.toUpperCase()}] ${message}`, context || '');
      }
    } else {
      // Production logs
      if (level === 'error' || level === 'fatal') {
        this.saveCriticalError(entry);
      }
    }
  }

  private saveCriticalError(entry: LogEntry) {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('omnix_critical_logs') || '[]');
        stored.unshift(entry);
        localStorage.setItem('omnix_critical_logs', JSON.stringify(stored.slice(0, 100))); // Keep last 100
      } catch (e) {
        console.error('Failed to save critical log', e);
      }
    } else {
      // Server-side
      console.error(JSON.stringify(entry));
    }
  }

  info(message: string, context?: any) { this.log('info', message, context); }
  warn(message: string, context?: any) { this.log('warn', message, context); }
  error(message: string, context?: any) { this.log('error', message, context); }
  fatal(message: string, context?: any) { this.log('fatal', message, context); }
  
  getLogs() {
    return this.logs;
  }
}

export const logger = Logger.getInstance();

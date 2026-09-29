import { supabase } from './supabase';
import React from 'react';
import { Link } from 'react-router-dom';

// Reserved usernames that cannot be used
export const RESERVED_USERNAMES = new Set([
  'admin', 'support', 'official', 'omnix', 'help', 'developer', 'system',
  'verified', 'security', 'login', 'signup', 'root', 'null', 'api'
]);

/**
 * Validates the username according to strict rules:
 * - 3-30 characters
 * - Letters (a-z, A-Z), numbers (0-9), underscores (_), dots (.), hyphens (-), apostrophes (') only
 * - No spaces, no emojis, no special characters
 * - Cannot start or end with ".", "_", "-", or "'"
 * - Cannot contain consecutive symbols
 * - Cannot be a reserved username
 */
export function validateUsernameFormat(username: string): string | null {
  if (!username) return "Username is required";
  
  const len = username.length;
  if (len < 3) return "Username must be at least 3 characters";
  if (len > 30) return "Username must be at most 30 characters";
  
  // Allowed characters: letters, numbers, _, ., -, '
  if (!/^[a-zA-Z0-9_.\-']+$/.test(username)) {
    return "Allowed characters: letters, numbers, _, ., -, ' only";
  }

  // Cannot start or end with special characters
  if (/^[._\-']|[._\-']$/.test(username)) {
    return "Username cannot start or end with a special character";
  }

  // Cannot contain consecutive special characters
  if (/[._\-']{2,}/.test(username)) {
    return "Username cannot contain consecutive special characters";
  }

  // Check reserved usernames
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return "This username is reserved and cannot be used";
  }

  return null; // Valid
}

/**
 * Performs a fast, case-insensitive check on Supabase to verify username availability.
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || validateUsernameFormat(username) !== null) return false;
  
  const escapedUsername = username.replace(/[_%]/g, '\\$&');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', escapedUsername)
    .limit(1);
    
  if (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
  
  return data.length === 0;
}

/**
 * Generates at least 20 smart, unique username suggestions based on a base text,
 * and performs a highly efficient batch-query in Supabase to check availability.
 */
export async function generateSuggestions(baseUsername: string): Promise<string[]> {
  const clean = baseUsername.replace(/[^a-zA-Z0-9_.\-']/g, '');
  if (!clean) return [];
  const candidatesSet = new Set<string>();
  
  // Artificial splitting for interesting combinations
  let firstPart = clean;
  let secondPart = '';
  if (clean.includes('.')) {
    const parts = clean.split('.');
    firstPart = parts[0];
    secondPart = parts[1];
  } else if (clean.includes('_')) {
    const parts = clean.split('_');
    firstPart = parts[0];
    secondPart = parts[1];
  } else if (clean.includes('-')) {
    const parts = clean.split('-');
    firstPart = parts[0];
    secondPart = parts[1];
  } else if (clean.length > 4) {
    const half = Math.floor(clean.length / 2);
    firstPart = clean.substring(0, half);
    secondPart = clean.substring(half);
  }

  const prefixes = ['real', 'official', 'its', 'hey', 'the', 'iam', 'original', 'hello', 'hereis', 'meet'];
  const suffixes = ['india', 'official', 'hub', 'world', 'app', 'studio', 'live', 'tech', 'creations', 'online'];
  const numbers = ['01', '07', '2005', '2026', '123', '99', '77', '10', '100', '88', '55', '22', '44', '33', '66'];

  // Add splits
  if (secondPart) {
    candidatesSet.add(`${firstPart}.${secondPart}`);
    candidatesSet.add(`${firstPart}_${secondPart}`);
    candidatesSet.add(`${firstPart}-${secondPart}`);
  } else if (clean.length >= 4) {
    for (let i = 2; i < clean.length - 1; i++) {
      candidatesSet.add(`${clean.substring(0, i)}.${clean.substring(i)}`);
      candidatesSet.add(`${clean.substring(0, i)}_${clean.substring(i)}`);
    }
  }

  // Add prefixes
  for (const pre of prefixes) {
    candidatesSet.add(`${pre}${clean}`);
    candidatesSet.add(`${pre}_${clean}`);
    candidatesSet.add(`${pre}.${clean}`);
  }

  // Add suffixes
  for (const suf of suffixes) {
    candidatesSet.add(`${clean}_${suf}`);
    candidatesSet.add(`${clean}.${suf}`);
  }

  // Add numbers
  for (const num of numbers) {
    candidatesSet.add(`${clean}${num}`);
    candidatesSet.add(`${clean}_${num}`);
    candidatesSet.add(`${clean}.${num}`);
  }

  // Filter candidates by basic formatting rules before checking db
  const candidates = Array.from(candidatesSet).filter(s => {
    return validateUsernameFormat(s) === null;
  });

  if (candidates.length === 0) return [];

  // Slice to max 60 candidates for batch query
  const queryCandidates = candidates.slice(0, 60);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .in('username', queryCandidates); // 'in' is case sensitive usually, but okay for suggestions checking. Or we can just filter available later.

    if (error) {
      console.error('Error batch checking suggestions:', error);
      return queryCandidates.slice(0, 20); // Fallback to query list
    }

    const takenUsernames = new Set(data?.map(row => row.username.toLowerCase()) || []);
    const available = queryCandidates.filter(c => !takenUsernames.has(c.toLowerCase()));

    // Ensure we have at least 20 suggestions by appending fallback numbers if needed
    let safetyCounter = 0;
    while (available.length < 20 && safetyCounter < 100) {
      const randNum = Math.floor(100 + Math.random() * 900);
      const extraCandidate = `${clean}_${randNum}`;
      if (
        validateUsernameFormat(extraCandidate) === null &&
        !takenUsernames.has(extraCandidate.toLowerCase()) &&
        !available.includes(extraCandidate)
      ) {
        available.push(extraCandidate);
      }
      safetyCounter++;
    }

    return available.slice(0, 20);
  } catch (err) {
    console.error('Failed to run batch suggestions query:', err);
    return queryCandidates.slice(0, 20);
  }
}

// Profile bio metadata serialization helpers
export interface ProfileBioMetadata {
  bio: string;
  location?: string;
  website?: string;
  pronouns?: string;
  businessEmail?: string;
  businessPhone?: string;
  socialLinks?: Record<string, string>;
  history?: Array<{ username: string; changed_at: string }>;
  redirects?: Record<string, { new_username: string; expires_at: string }>;
}

export function parseProfileBio(bioText: string | null): ProfileBioMetadata {
  if (!bioText) {
    return { bio: '' };
  }
  const trimmed = bioText.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return { bio: bioText };
    }
  }
  return { bio: bioText };
}

export function serializeProfileBio(metadata: ProfileBioMetadata): string {
  return JSON.stringify(metadata);
}

/**
 * Parses a text string and converts any @username mention into a clickable Link component.
 */
export function renderMentions(text: string | null | undefined): React.ReactNode | string {
  if (!text) return '';
  
  const parts = text.split(/(@[a-z0-9_.]+)/gi);
  
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        // Rough match against username length/regex rules to avoid false positives
        if (username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_.\-']+$/.test(username)) {
          return React.createElement(
            Link,
            {
              key: index,
              to: `/@${username}`,
              className: "text-purple-400 hover:underline font-semibold",
              onClick: (e: React.MouseEvent) => e.stopPropagation()
            },
            part
          );
        }
      }
      return part;
    })
  );
}

import type { ReactNode } from 'react';

export type HomeTab =
  | 'connect'
  | 'about'
  | 'games'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'certificates'
  | 'contact';

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  status: string;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  icon: ReactNode;
}

export interface Hobby {
  icon: ReactNode;
  text: string;
  color: string;
}

export interface Skill {
  name: string;
  level: number;
  icon: ReactNode;
  category?: string;
}

export interface Certificate {
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image: string;
  icon: ReactNode;
}

export interface ContactInfo {
  type: string;
  value: string;
  icon: ReactNode;
  color: string;
}

export interface SocialMedia {
  name: string;
  icon: ReactNode;
  url: string;
  color: string;
}

export interface RobloxProfile {
  username: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  avatarUrl: string;
  friendsCount?: number;
  followersCount?: number;
}

export interface DiscordStatus {
  online: boolean;
  status: string;
  activity?: {
    name: string;
    details?: string | null;
    state?: string | null;
    largeImage?: string | null;
  } | null;
  customStatus?: string | null;
  spotify?: {
    song: string;
    artist: string;
    album: string;
  } | null;
}


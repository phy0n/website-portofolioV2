'use client';

import { FaGithub, FaDiscord, FaXTwitter, FaInstagram, FaTiktok, FaSpotify } from 'react-icons/fa6';

import type { SocialMedia } from '../types';

export const SOCIAL_MEDIA: SocialMedia[] = [
  {
    name: 'GitHub',
    icon: <FaGithub className="h-5 w-5" />,
    url: 'https://github.com/phy0n',
    color: '',
  },
  {
    name: 'Discord Server',
    icon: <FaDiscord className="h-5 w-5" />,
    url: 'https://discord.gg/MwNE7Vfb6t',
    color: '',
  },
  {
    name: 'X.com',
    icon: <FaXTwitter className="h-5 w-5" />,
    url: 'https://x.com/phy0n',
    color: '',
  },
  {
    name: 'Instagram',
    icon: <FaInstagram className="h-5 w-5" />,
    url: 'https://www.instagram.com/rushandle/',
    color: '',
  },
  {
    name: 'TikTok',
    icon: <FaTiktok className="h-5 w-5" />,
    url: 'https://www.tiktok.com/@phy0n',
    color: '',
  },
  {
    name: 'Spotify',
    icon: <FaSpotify className="h-5 w-5" />,
    url: 'https://open.spotify.com/user/31v426yxkijy2kdgwfv7izq6gd3e',
    color: '',
  },
];

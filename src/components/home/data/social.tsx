'use client';

import { Instagram } from 'lucide-react';
import { FaDiscord, FaTiktok } from 'react-icons/fa';

import type { SocialMedia } from '../types';

export const SOCIAL_MEDIA: SocialMedia[] = [
  {
    name: 'Instagram',
    icon: <Instagram className="h-5 w-5" />,
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
    name: 'Discord Server',
    icon: <FaDiscord className="h-5 w-5" />,
    url: 'https://discord.gg/MwNE7Vfb6t',
    color: '',
  },
];

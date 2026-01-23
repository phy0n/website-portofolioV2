import type { StaticImageData } from 'next/image';

import diaDanMahkotanya from '../../public/image/blogImage/dia-dan-mahkotanya.jpg';
import natalApiKecilCopy from '../../public/image/blogImage/natal-api-kecil-2026 copy.jpg';
import natalApiKecil from '../../public/image/blogImage/natal-api-kecil-2026.jpg';
import temanAtauHarapan from '../../public/image/blogImage/teman-atau-harapan.jpg';
import tentangKitaYangTumbuh from '../../public/image/blogImage/tentang-kita-yang-tumbuh-dan-kalah-oleh-jarak.jpg';
import tentangmuYangTak from '../../public/image/blogImage/tentangmu-yang-tak-pernah-bisa-ku-miliki.jpg';

export type BlogImageOption = {
  value: string;
  label: string;
  preview: StaticImageData;
};

export const blogImageOptions: BlogImageOption[] = [
  {
    value: '/image/blogImage/dia-dan-mahkotanya.jpg',
    label: 'dia-dan-mahkotanya.jpg',
    preview: diaDanMahkotanya,
  },
  {
    value: '/image/blogImage/natal-api-kecil-2026 copy.jpg',
    label: 'natal-api-kecil-2026 copy.jpg',
    preview: natalApiKecilCopy,
  },
  {
    value: '/image/blogImage/natal-api-kecil-2026.jpg',
    label: 'natal-api-kecil-2026.jpg',
    preview: natalApiKecil,
  },
  {
    value: '/image/blogImage/teman-atau-harapan.jpg',
    label: 'teman-atau-harapan.jpg',
    preview: temanAtauHarapan,
  },
  {
    value: '/image/blogImage/tentang-kita-yang-tumbuh-dan-kalah-oleh-jarak.jpg',
    label: 'tentang-kita-yang-tumbuh-dan-kalah-oleh-jarak.jpg',
    preview: tentangKitaYangTumbuh,
  },
  {
    value: '/image/blogImage/tentangmu-yang-tak-pernah-bisa-ku-miliki.jpg',
    label: 'tentangmu-yang-tak-pernah-bisa-ku-miliki.jpg',
    preview: tentangmuYangTak,
  },
];

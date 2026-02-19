export const CHAT_AUTHOR_NAME = (() => {
  const raw = process.env.NEXT_PUBLIC_CHAT_AUTHOR_NAME ?? 'Phy0n';

  const normalized = String(raw || '').trim().slice(0, 40);
  return normalized || 'Phy0n';
})();

export type ChatRole = 'author' | 'viewers';

export const normalizeChatName = (value: string) => value.trim().slice(0, 40);
export const normalizeChatMessage = (value: string) => value.trim().slice(0, 500);

export const isAuthorChatName = (value: string) =>
  normalizeChatName(value).toLowerCase() === CHAT_AUTHOR_NAME.toLowerCase();

export const getChatRoleForName = (value: string): ChatRole =>
  isAuthorChatName(value) ? 'author' : 'viewers';


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 日知｜每日 AI 新闻精选',
  description: '每天 3 分钟，读懂真正重要的 AI 新闻。',
};

export default function AiNewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

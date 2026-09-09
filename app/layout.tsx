import './globals.css';

export const metadata = {
  title: '帧语 FrameFlow｜AI 视频制作工作台',
  description: '用 AI 完成脚本、分镜、画面、旁白、配乐与视频导出。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

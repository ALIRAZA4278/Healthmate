import './globals.css';

export const metadata = {
  title: 'HealthMate - Sehat ka Smart Dost',
  description: 'Track your medical reports, vitals, and health metrics with AI-powered insights. Manage health records for your entire family.',
  keywords: 'health tracker, medical reports, vitals tracking, AI health analysis, family health management, HealthMate',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

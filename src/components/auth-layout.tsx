import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-gradient min-h-screen w-full flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuthLayout;

import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Logo } from '../components/ui/Logo';
import { API_BASE_URL } from '../lib/constants';
import { useLocation } from 'react-router-dom';
import { useToaster } from '../components/ui/Toaster';

const Auth = () => {
  const location = useLocation();
  const { addToast } = useToaster();
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error');

  React.useEffect(() => {
    if (error) {
      addToast('Authentication failed. Please try again.', 'error');
    }
  }, [error, addToast]);

  const handleLogin = (provider) => {
    // Redirect browser to server auth entry point
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <PageWrapper>
      <main className="min-h-screen flex items-center justify-center pt-20 px-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                <Logo size={64} className="relative z-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-on-surface uppercase italic">
                User Sign In
              </h1>
              <p className="text-on-surface-variant font-mono text-xs uppercase tracking-[0.2em]">
                Secure Identity Verification
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => handleLogin('google')}
                className="w-full flex items-center justify-center gap-3 bg-white text-neutral-900 py-3 rounded-xl font-bold font-inter hover:bg-neutral-100 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                onClick={() => handleLogin('github')}
                className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white py-3 rounded-xl font-bold font-inter hover:bg-[#2f363d] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg border border-white/5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="relative pt-4 text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-container-low px-4 text-on-surface-variant font-mono">Professional Access</span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 font-mono text-center leading-relaxed max-w-[280px] mx-auto uppercase">
              By signing in, you agree to the TypeCraft Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Auth;

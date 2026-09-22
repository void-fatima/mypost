import { ArrowLeft, Home, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/logo';
import { Button } from '../../components/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="relative grid min-h-screen place-items-center bg-canvas px-4 py-12 text-center overflow-hidden">
      <div className="route-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative z-10 max-w-md">
        <Logo />

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider">
          <span>Error 404 · Route Exception</span>
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-ink">
          This shipment route ends here.
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          The requested operational resource or tracking destination could not be located in the network ledger.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)} className="w-full sm:w-auto gap-2">
            <ArrowLeft className="size-4" />
            <span>Go back</span>
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2">
              <Home className="size-4" />
              <span>Return to home</span>
            </Button>
          </Link>

          <Link to="/track" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto gap-2 text-brand">
              <Search className="size-4" />
              <span>Track shipment</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

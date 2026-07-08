import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { SmoothScroll } from '@/lib/smooth-scroll';
import { PageLoader } from '@/components/ui/page-loader';

const LandingPage = lazy(() => import('@/pages/landing'));
const BlogPage = lazy(() => import('@/pages/blog'));
const ArticlePage = lazy(() => import('@/pages/article'));
const AdminPage = lazy(() => import('@/pages/admin'));

export default function App(): React.ReactNode {
  return (
    <SmoothScroll>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page — served at root */}
          <Route path="/" element={<LandingPage />} />
          {/* Portfolio pages — under /portfolio/ prefix */}
          <Route path="/portfolio" element={<LandingPage />} />
          <Route path="/portfolio/blog" element={<BlogPage />} />
          <Route path="/portfolio/blog/:slug" element={<ArticlePage />} />
          <Route path="/portfolio/panel" element={<AdminPage />} />
          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}

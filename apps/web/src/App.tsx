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
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/panel" element={<AdminPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}

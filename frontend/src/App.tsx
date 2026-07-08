import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { VisionModeProvider } from './context/VisionModeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkError from './components/NetworkError';
import { useSite } from './context/SiteContext';
import Analytics from './components/Analytics';
import ScrollProgress from './components/ScrollProgress';
import TopProgressBar from './components/TopProgressBar';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import { PageAnimationLayout } from './components/PageTransition';

// Public pages — Home грузим сразу (первый экран), остальное лениво.
import Home from './pages/Home';
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const About = lazy(() => import('./pages/About'));
const Halls = lazy(() => import('./pages/Halls'));
const Gallery = lazy(() => import('./pages/Gallery'));
const GalleryCategory = lazy(() => import('./pages/GalleryCategory'));
const Organizers = lazy(() => import('./pages/Organizers'));
const Audience = lazy(() => import('./pages/Audience'));
const Contacts = lazy(() => import('./pages/Contacts'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const PersonalDataConsent = lazy(() => import('./pages/PersonalDataConsent'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages — отдельный бандл, грузится только в /admin.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminHalls = lazy(() => import('./pages/admin/AdminHalls'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function PublicLayout() {
  const location = useLocation();
  const { error, loading } = useSite();

  return (
    <SmoothScrollProvider routeKey={location.pathname}>
      <div className="flex min-h-screen flex-col text-ink">
        <ScrollProgress />
        <Header />
        <main className="flex min-h-0 flex-1 flex-col">
          {error && !loading ? (
            <NetworkError />
          ) : (
          <Suspense fallback={null}>
          <Routes>
            <Route element={<PageAnimationLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="about" element={<About />} />
              <Route path="halls" element={<Halls />} />
              <Route path="gallery/:slug" element={<GalleryCategory />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="organizers" element={<Organizers />} />
              <Route path="audience" element={<Audience />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="news" element={<News />} />
              <Route path="news/:id" element={<NewsDetail />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="personal-data-consent" element={<PersonalDataConsent />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </Suspense>
          )}
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </SmoothScrollProvider>
  );
}

function AppShell() {
  return (
    <>
      <TopProgressBar />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="halls" element={<AdminHalls />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <VisionModeProvider>
          <ErrorBoundary>
            <Analytics />
            <AppShell />
          </ErrorBoundary>
        </VisionModeProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}

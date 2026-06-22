import { useCallback, useState } from 'react';
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
import Preloader from './components/Preloader';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import { PageAnimationLayout } from './components/PageTransition';

// Public pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import About from './pages/About';
import Halls from './pages/Halls';
import Gallery from './pages/Gallery';
import GalleryCategory from './pages/GalleryCategory';
import Organizers from './pages/Organizers';
import Audience from './pages/Audience';
import Contacts from './pages/Contacts';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PersonalDataConsent from './pages/PersonalDataConsent';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNews from './pages/admin/AdminNews';
import AdminHalls from './pages/admin/AdminHalls';
import AdminGallery from './pages/admin/AdminGallery';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPartners from './pages/admin/AdminPartners';

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
              <Route path="terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          )}
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </SmoothScrollProvider>
  );
}

function AppShell() {
  const [bootDone, setBootDone] = useState(false);
  const handlePreloaderComplete = useCallback(() => {
    setBootDone(true);
  }, []);

  return (
    <>
      {!bootDone ? <Preloader onComplete={handlePreloaderComplete} /> : null}
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="halls" element={<AdminHalls />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
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

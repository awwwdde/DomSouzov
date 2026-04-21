import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import About from './pages/About';
import Halls from './pages/Halls';
import Gallery from './pages/Gallery';
import Organizers from './pages/Organizers';
import Audience from './pages/Audience';
import Contacts from './pages/Contacts';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNews from './pages/admin/AdminNews';
import AdminHalls from './pages/admin/AdminHalls';
import AdminGallery from './pages/admin/AdminGallery';
import AdminSettings from './pages/admin/AdminSettings';

function PublicLayout() {
  return (
    <div className="site">
      <Header />
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="about" element={<About />} />
          <Route path="halls" element={<Halls />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="organizers" element={<Organizers />} />
          <Route path="audience" element={<Audience />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Routes>
          {/* Admin routes (no Header/Footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="halls" element={<AdminHalls />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Public routes */}
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </SiteProvider>
    </BrowserRouter>
  );
}

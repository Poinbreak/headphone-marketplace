import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FindHeadphones from './pages/FindHeadphones';
import Results from './pages/Results';
import Compare from './pages/Compare';
import ProductDetails from './pages/ProductDetails';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find" element={<FindHeadphones />} />
          <Route path="/results" element={<Results />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

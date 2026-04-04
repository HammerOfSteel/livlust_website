import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Offer from '../components/Offer';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Offer />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

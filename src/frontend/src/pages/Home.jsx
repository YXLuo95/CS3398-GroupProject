import HeroSection from "../components/home/HeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import FeaturesSection from "../components/home/FeaturesSection";
import ProductPreviewSection from "../components/home/ProductPreviewSection";
import FinalCTASection from "../components/home/FinalCTASection";
import styles from "./Home.module.css";

export default function Home() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        <HeroSection isLoggedIn={isLoggedIn} />
        <HowItWorksSection />
        <FeaturesSection isLoggedIn={isLoggedIn} />
        <ProductPreviewSection />
        <FinalCTASection isLoggedIn={isLoggedIn} />
      </div>
    </main>
  );
}

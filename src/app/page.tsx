import WelcomeHeader from "@/components/WelcomeHeader";
import WelcomeHero from "@/components/WelcomeHero";
import WelcomeFeatures from "@/components/WelcomeFeatures";
import WelcomeCTA from "@/components/WelcomeCTA";
import WelcomeFooter from "@/components/WelcomeFooter";

export default function HomePage() {
  return (
    <>
      <WelcomeHeader />
      <main>
        <WelcomeHero />
        <WelcomeFeatures />
        <WelcomeCTA />
      </main>
      <WelcomeFooter />
    </>
  );
}

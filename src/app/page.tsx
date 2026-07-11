import {
  WelcomeHeader,
  WelcomeHero,
  WelcomeFeatures,
  WelcomeCTA,
  WelcomeFooter,
} from "@/components/welcome";

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

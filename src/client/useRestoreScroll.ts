import { useEffect } from "react";
import { useRouter } from "next/router";

// Don't preserve across hard refresh.
let savedScrollPos = 0;

export function useRestoreScroll() {
  const router = useRouter();

  useEffect(() => {
    // Only preserve scroll position for the main feed
    if (router.asPath !== "/") return;

    const saveScrollPos = () => {
      const scrollPos = document.documentElement.scrollTop;
      console.log(`Saving scroll position ${scrollPos}`);
      savedScrollPos = scrollPos;
    };

    // Restore scroll pos
    if (savedScrollPos) document.documentElement.scrollTop = savedScrollPos;

    router.events.on("routeChangeStart", saveScrollPos);
    return () => router.events.off("routeChangeStart", saveScrollPos);
  }, [router]);
}

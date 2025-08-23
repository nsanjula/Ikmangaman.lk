import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top instantly when pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);
};
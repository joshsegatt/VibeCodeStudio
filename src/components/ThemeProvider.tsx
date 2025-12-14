import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { currentTheme, applyTheme } = useThemeStore();

    // Apply theme on mount and when theme changes
    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme, applyTheme]);

    return <>{children}</>;
}

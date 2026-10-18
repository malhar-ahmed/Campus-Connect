import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextObject";

function getInitialTheme() {
    const savedTheme = localStorage.getItem("campusconnect_theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("campusconnect_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        document.documentElement.classList.add("theme-switching");

        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );

        window.setTimeout(() => {
            document.documentElement.classList.remove("theme-switching");
        }, 100);
    };

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            isDarkMode: theme === "dark",
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
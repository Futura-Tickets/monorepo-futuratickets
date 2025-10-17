"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import './ThemeToggle.scss';

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    effectiveTheme: 'light' | 'dark'; // The actual theme being displayed
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('auto');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('futura-theme') as Theme;
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    // Update effective theme based on current theme and system preference
    useEffect(() => {
        const updateEffectiveTheme = () => {
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setEffectiveTheme(prefersDark ? 'dark' : 'light');
            } else {
                setEffectiveTheme(theme);
            }
        };

        updateEffectiveTheme();

        // Listen for system theme changes when in auto mode
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => updateEffectiveTheme();

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
                return () => mediaQuery.removeEventListener('change', handleChange);
            }
            // Fallback for older browsers
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
                return () => mediaQuery.removeListener(handleChange);
            }
        }
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', effectiveTheme);
    }, [effectiveTheme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('futura-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Theme Toggle Button Component
export const ThemeToggle: React.FC = () => {
    const { theme, effectiveTheme, setTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);

    const handleCycleTheme = () => {
        if (showMenu) {
            setShowMenu(false);
            return;
        }

        // Simple toggle: light → dark → light
        if (effectiveTheme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    const handleSelectTheme = (selectedTheme: Theme) => {
        setTheme(selectedTheme);
        setShowMenu(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.theme-toggle')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    return (
        <div className="theme-toggle">
            <button
                className={`theme-toggle-button ${effectiveTheme === 'dark' ? 'dark' : 'light'}`}
                onClick={handleCycleTheme}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setShowMenu(!showMenu);
                }}
                aria-label={`Cambiar tema (actual: ${effectiveTheme})`}
                title="Click: cambiar tema | Click derecho: opciones"
            >
                {effectiveTheme === 'dark' ? (
                    <BulbFilled className="theme-icon" />
                ) : (
                    <BulbOutlined className="theme-icon" />
                )}
                <span className="theme-label">{effectiveTheme === 'dark' ? 'Oscuro' : 'Claro'}</span>
            </button>

            {showMenu && (
                <div className="theme-menu">
                    <button
                        className={`theme-menu-item ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleSelectTheme('light')}
                    >
                        <BulbOutlined />
                        <span>Claro</span>
                    </button>
                    <button
                        className={`theme-menu-item ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleSelectTheme('dark')}
                    >
                        <BulbFilled />
                        <span>Oscuro</span>
                    </button>
                    <button
                        className={`theme-menu-item ${theme === 'auto' ? 'active' : ''}`}
                        onClick={() => handleSelectTheme('auto')}
                    >
                        <BulbOutlined style={{ opacity: 0.6 }} />
                        <span>Automático</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Compact version for menu integration
export const ThemeToggleCompact: React.FC = () => {
    const { effectiveTheme, setTheme } = useTheme();

    const handleToggle = () => {
        setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            className="theme-toggle-compact"
            onClick={handleToggle}
            aria-label={`Cambiar a modo ${effectiveTheme === 'light' ? 'oscuro' : 'claro'}`}
        >
            {effectiveTheme === 'dark' ? (
                <BulbFilled className="theme-icon" />
            ) : (
                <BulbOutlined className="theme-icon" />
            )}
        </button>
    );
};

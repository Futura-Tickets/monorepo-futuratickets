"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MinusOutlined, PlusOutlined, FontSizeOutlined } from '@ant-design/icons';
import './FontSizeControl.scss';

// Font Size Types
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface FontSizeContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    increase: () => void;
    decrease: () => void;
    reset: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (!context) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
};

interface FontSizeProviderProps {
    children: ReactNode;
}

const fontSizes: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

const fontSizeScales = {
    small: 0.875, // 87.5%
    medium: 1, // 100% (default)
    large: 1.125, // 112.5%
    xlarge: 1.25, // 125%
};

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>('medium');

    // Load font size from localStorage on mount
    useEffect(() => {
        const savedSize = localStorage.getItem('futura-font-size') as FontSize;
        if (savedSize && fontSizes.includes(savedSize)) {
            setFontSizeState(savedSize);
        }
    }, []);

    // Apply font size to document
    useEffect(() => {
        const scale = fontSizeScales[fontSize];
        document.documentElement.style.setProperty('--font-scale', scale.toString());
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, [fontSize]);

    const setFontSize = (newSize: FontSize) => {
        setFontSizeState(newSize);
        localStorage.setItem('futura-font-size', newSize);
    };

    const increase = () => {
        const currentIndex = fontSizes.indexOf(fontSize);
        if (currentIndex < fontSizes.length - 1) {
            setFontSize(fontSizes[currentIndex + 1]);
        }
    };

    const decrease = () => {
        const currentIndex = fontSizes.indexOf(fontSize);
        if (currentIndex > 0) {
            setFontSize(fontSizes[currentIndex - 1]);
        }
    };

    const reset = () => {
        setFontSize('medium');
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize, increase, decrease, reset }}>
            {children}
        </FontSizeContext.Provider>
    );
};

// Font Size Control Component
export const FontSizeControl: React.FC = () => {
    const { fontSize, increase, decrease, reset } = useFontSize();
    const [showMenu, setShowMenu] = useState(false);

    const canDecrease = fontSize !== 'small';
    const canIncrease = fontSize !== 'xlarge';

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.font-size-control')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    const getFontSizeLabel = (size: FontSize): string => {
        const labels = {
            small: 'Pequeña',
            medium: 'Mediana',
            large: 'Grande',
            xlarge: 'Muy grande',
        };
        return labels[size];
    };

    return (
        <div className="font-size-control">
            <button
                className="font-size-toggle"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Ajustar tamaño de fuente"
                title="Ajustar tamaño de fuente"
            >
                <FontSizeOutlined className="font-icon" />
                <span className="font-label">{getFontSizeLabel(fontSize)}</span>
            </button>

            {showMenu && (
                <div className="font-size-menu">
                    <div className="font-size-header">
                        <span className="font-size-title">Tamaño de texto</span>
                    </div>

                    <div className="font-size-controls">
                        <button
                            className="font-size-btn"
                            onClick={decrease}
                            disabled={!canDecrease}
                            aria-label="Disminuir tamaño"
                            title="Disminuir"
                        >
                            <MinusOutlined />
                        </button>

                        <div className="font-size-display">
                            <div className="font-size-current">{getFontSizeLabel(fontSize)}</div>
                            <div className="font-size-scale">{Math.round(fontSizeScales[fontSize] * 100)}%</div>
                        </div>

                        <button
                            className="font-size-btn"
                            onClick={increase}
                            disabled={!canIncrease}
                            aria-label="Aumentar tamaño"
                            title="Aumentar"
                        >
                            <PlusOutlined />
                        </button>
                    </div>

                    <div className="font-size-presets">
                        {fontSizes.map((size) => (
                            <button
                                key={size}
                                className={`font-size-preset ${fontSize === size ? 'active' : ''}`}
                                onClick={() => {
                                    const { setFontSize } = useFontSize();
                                    setFontSize(size);
                                }}
                                style={{ fontSize: `${fontSizeScales[size]}rem` }}
                            >
                                A
                            </button>
                        ))}
                    </div>

                    <button
                        className="font-size-reset"
                        onClick={reset}
                        disabled={fontSize === 'medium'}
                    >
                        Restablecer
                    </button>
                </div>
            )}
        </div>
    );
};

// Compact version for menu integration
export const FontSizeControlCompact: React.FC = () => {
    const { increase, decrease, fontSize } = useFontSize();
    const [showControls, setShowControls] = useState(false);

    const canDecrease = fontSize !== 'small';
    const canIncrease = fontSize !== 'xlarge';

    return (
        <div className="font-size-control-compact">
            <button
                className="font-size-icon"
                onClick={() => setShowControls(!showControls)}
                aria-label="Ajustar tamaño de fuente"
            >
                <FontSizeOutlined />
            </button>

            {showControls && (
                <div className="font-size-quick-controls">
                    <button
                        onClick={decrease}
                        disabled={!canDecrease}
                        aria-label="Disminuir"
                        title="Disminuir tamaño"
                    >
                        <MinusOutlined />
                    </button>
                    <span className="font-size-indicator">{fontSize[0].toUpperCase()}</span>
                    <button
                        onClick={increase}
                        disabled={!canIncrease}
                        aria-label="Aumentar"
                        title="Aumentar tamaño"
                    >
                        <PlusOutlined />
                    </button>
                </div>
            )}
        </div>
    );
};

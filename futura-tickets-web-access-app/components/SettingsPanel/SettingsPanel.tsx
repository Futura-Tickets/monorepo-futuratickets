"use client";
import React, { useState } from 'react';
import { SettingOutlined, CloseOutlined } from '@ant-design/icons';
import { ThemeToggle, ThemeProvider, useTheme } from '../ThemeToggle/ThemeToggle';
import { FontSizeControl, FontSizeProvider, useFontSize } from '../FontSizeControl/FontSizeControl';
import './SettingsPanel.scss';

// Settings Panel Content (needs to be inside providers)
const SettingsPanelContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { theme, effectiveTheme } = useTheme();
    const { fontSize } = useFontSize();

    return (
        <div className="settings-panel-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <div className="settings-title">
                        <SettingOutlined className="settings-icon" />
                        <span>Configuración</span>
                    </div>
                    <button
                        className="settings-close"
                        onClick={onClose}
                        aria-label="Cerrar configuración"
                    >
                        <CloseOutlined />
                    </button>
                </div>

                <div className="settings-content">
                    <div className="settings-section">
                        <div className="settings-section-title">Apariencia</div>
                        <div className="settings-item">
                            <div className="settings-item-info">
                                <div className="settings-item-label">Tema</div>
                                <div className="settings-item-description">
                                    Actual: {effectiveTheme === 'dark' ? 'Oscuro' : 'Claro'}
                                    {theme === 'auto' && ' (Automático)'}
                                </div>
                            </div>
                            <div className="settings-item-control">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="settings-section-title">Accesibilidad</div>
                        <div className="settings-item">
                            <div className="settings-item-info">
                                <div className="settings-item-label">Tamaño de texto</div>
                                <div className="settings-item-description">
                                    Ajusta el tamaño de fuente según tus preferencias
                                </div>
                            </div>
                            <div className="settings-item-control">
                                <FontSizeControl />
                            </div>
                        </div>
                    </div>

                    <div className="settings-footer">
                        <p className="settings-info">
                            La configuración se guarda automáticamente en tu dispositivo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Settings Button Component
export const SettingsButton: React.FC = () => {
    const [showPanel, setShowPanel] = useState(false);

    return (
        <>
            <button
                className="settings-button"
                onClick={() => setShowPanel(true)}
                aria-label="Abrir configuración"
                title="Configuración"
            >
                <SettingOutlined className="settings-button-icon" />
            </button>

            {showPanel && <SettingsPanelContent onClose={() => setShowPanel(false)} />}
        </>
    );
};

// Complete Settings Panel with Providers
export const SettingsPanel: React.FC = () => {
    return (
        <ThemeProvider>
            <FontSizeProvider>
                <SettingsButton />
            </FontSizeProvider>
        </ThemeProvider>
    );
};

// Wrapper to provide theme and font size to the entire app
export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeProvider>
            <FontSizeProvider>
                {children}
            </FontSizeProvider>
        </ThemeProvider>
    );
};

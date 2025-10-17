"use client";
import { useEffect, useRef, useState } from 'react';

// QRCODE
import QrScanner from 'qr-scanner';

// ANTD
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined';
import { LoadingOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined, BulbOutlined, BulbFilled, CameraOutlined, SwapOutlined } from '@ant-design/icons';

// COMPONENTS
import Menu from '@/shared/Menu/Menu';

// SERVICES
import { checkAccess } from '@/shared/services';

// INTERFACES
import { ScanResult } from '@/shared/interfaces';

// UTILS
import { feedbackSuccess, feedbackError, feedbackProcessing } from '@/shared/utils/feedback';

// STYLES
import './QrCode.scss';

export default function QrCode() {
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [qrScanner, setQrScanner] = useState<QrScanner>();
    const [scanResult, setScanResult] = useState<ScanResult | undefined>();
    const scanResultRef = useRef<ScanResult | undefined>(undefined);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [sessionStats, setSessionStats] = useState({ granted: 0, denied: 0, total: 0 });
    const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const startQrScanner = () => {
        const qrScanner = new QrScanner(
            videoRef.current!,
            (result: QrScanner.ScanResult) => {
                if (result.data && scanResultRef.current == undefined) checkTicket(result.data, qrScanner);
            },
            {
                preferredCamera: facingMode,
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );

        setQrScanner(qrScanner);
    };

    const toggleFlash = async () => {
        if (qrScanner && await qrScanner.hasFlash()) {
            try {
                await qrScanner.toggleFlash();
                setFlashEnabled(!flashEnabled);
            } catch (error) {
                console.error('Error toggling flash:', error);
            }
        }
    };

    const switchCamera = async () => {
        if (qrScanner) {
            try {
                await qrScanner.stop();
                const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
                setFacingMode(newFacingMode);

                const newScanner = new QrScanner(
                    videoRef.current!,
                    (result: QrScanner.ScanResult) => {
                        if (result.data && scanResultRef.current == undefined) checkTicket(result.data, newScanner);
                    },
                    {
                        preferredCamera: newFacingMode,
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    }
                );

                setQrScanner(newScanner);
                await newScanner.start();
            } catch (error) {
                console.error('Error switching camera:', error);
            }
        }
    };

    const checkTicket = async (qrCode: string, qrScanner: QrScanner): Promise<void> => {
        try {

            // Processing feedback
            feedbackProcessing();

            scanResultRef.current = { access: 'PROCESSING', reason: 'PROCESSING' };
            setScanResult({ access: 'PROCESSING', reason: 'PROCESSING' });

            const ticket = qrCode.split('/')[4];
            const access = await checkAccess(ticket);

            // Add timestamp and qrCode to result
            const enrichedAccess = {
                ...access,
                timestamp: Date.now(),
                qrCode: ticket
            };

            scanResultRef.current = enrichedAccess;
            setScanResult(enrichedAccess);

            // Add to history (keep last 10)
            setScanHistory(prev => [enrichedAccess, ...prev].slice(0, 10));

            // Update session stats
            setSessionStats(prev => ({
                total: prev.total + 1,
                granted: access.access === 'GRANTED' ? prev.granted + 1 : prev.granted,
                denied: access.access === 'DENIED' ? prev.denied + 1 : prev.denied
            }));

            // Feedback based on result
            if (access.access === 'GRANTED') {
                feedbackSuccess();
            } else if (access.access === 'DENIED') {
                feedbackError();
            }

        } catch (error) {

            feedbackError();
            const errorResult = {
                access: 'DENIED',
                reason: 'ERROR PROCESSING TICKET',
                timestamp: Date.now()
            };
            setScanResult(errorResult);
            scanResultRef.current = errorResult;

            // Add error to history
            setScanHistory(prev => [errorResult, ...prev].slice(0, 10));
            setSessionStats(prev => ({
                total: prev.total + 1,
                granted: prev.granted,
                denied: prev.denied + 1
            }));

        }
    };

    const resetAccess = () => {
        setScanResult(undefined);
        scanResultRef.current = undefined;
    };

    const adjustContainerSize = () => {
        if (containerRef.current) {
            const windowHeight = window.innerHeight;
            containerRef.current.style.height = `${windowHeight}px`;
            
            const contentElement = containerRef.current.querySelector('.qrcode-content');
            if (contentElement) {
                (contentElement as HTMLElement).style.height = `${windowHeight - 60}px`;
            }
        }
    };

    useEffect(() => {
        videoRef && videoRef.current && startQrScanner();
        
        setTimeout(adjustContainerSize, 300);
        
        window.addEventListener('resize', adjustContainerSize);
        
        return () => {
            window.removeEventListener('resize', adjustContainerSize);
        };
    }, [videoRef]);

    useEffect(() => {
        qrScanner && qrScanner.start();
    }, [qrScanner]);

    return (
        <div className="qrcode-container" ref={containerRef}>
            <div className="qrcode-content">
                <img src="/assets/futura-tickets-white.png" className="logo"/>

                {/* Session Stats */}
                <div className="session-stats">
                    <div className="stat-item success">
                        <CheckCircleOutlined />
                        <span>{sessionStats.granted}</span>
                    </div>
                    <div className="stat-item total">
                        <span>Total: {sessionStats.total}</span>
                    </div>
                    <div className="stat-item error">
                        <CloseCircleOutlined />
                        <span>{sessionStats.denied}</span>
                    </div>
                    <div className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
                        <HistoryOutlined />
                    </div>
                </div>

                <video ref={videoRef}></video>

                {/* Camera Controls */}
                <div className="camera-controls">
                    <div className="control-button" onClick={toggleFlash} title="Flash/Linterna">
                        {flashEnabled ? <BulbFilled /> : <BulbOutlined />}
                    </div>
                    <div className="control-button" onClick={switchCamera} title="Cambiar cámara">
                        <SwapOutlined />
                    </div>
                </div>

                <div className="qrcode-scanner">
                    {(scanResult && scanResult.access == 'PROCESSING') && <LoadingOutlined />}
                    <img src="/assets/scan-white.png" className={"scann-icon " + (scanResult ? "active" : "")}/>
                </div>
                {(scanResult && scanResult.access != 'PROCESSING') && (
                    <div className="qrcode-result-container">
                        <div className={"qrcode-result-content " + scanResult.access}>
                            <div className="qrcode-header">
                                <h3>{scanResult.access}</h3> - <span>{scanResult.reason}</span>
                            </div>
                            <div className="qrcode-info">
                                <p><span>{scanResult.name}</span></p>
                                <p><span>{scanResult.type}</span> / <span>{scanResult.price} EUR</span></p>
                            </div>
                            <span className="close" onClick={() => resetAccess()}>
                                <CloseOutlined />
                            </span>
                        </div>
                    </div>
                )}

                {/* Scan History Panel */}
                {showHistory && (
                    <div className="scan-history-panel">
                        <div className="history-header">
                            <h3>Historial de Escaneos</h3>
                            <CloseOutlined onClick={() => setShowHistory(false)} />
                        </div>
                        <div className="history-list">
                            {scanHistory.length === 0 ? (
                                <div className="history-empty">
                                    <p>No hay escaneos en esta sesión</p>
                                </div>
                            ) : (
                                scanHistory.map((scan, index) => (
                                    <div key={index} className={`history-item ${scan.access.toLowerCase()}`}>
                                        <div className="history-item-header">
                                            <span className="history-status">{scan.access}</span>
                                            <span className="history-time">
                                                {scan.timestamp ? new Date(scan.timestamp).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                }) : '-'}
                                            </span>
                                        </div>
                                        {scan.name && (
                                            <div className="history-item-info">
                                                <span>{scan.name}</span>
                                                {scan.type && <span> • {scan.type}</span>}
                                            </div>
                                        )}
                                        <div className="history-item-reason">{scan.reason}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Menu/>
        </div>
    );
}

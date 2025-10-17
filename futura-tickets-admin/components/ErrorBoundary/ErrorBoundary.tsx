'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Card, Space, Collapse } from 'antd';
import { CloseCircleOutlined, ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f0f2f5',
          }}
        >
          <Card style={{ maxWidth: '800px', width: '100%' }}>
            <Result
              status="error"
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              title="Algo salió mal"
              subTitle="Lo sentimos, ha ocurrido un error inesperado."
              extra={[
                <Space key="actions" size="middle">
                  <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                    Recargar
                  </Button>
                  <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                    Inicio
                  </Button>
                </Space>,
              ]}
            >
              {process.env.NODE_ENV === 'development' && error && (
                <div style={{ marginTop: '24px', textAlign: 'left' }}>
                  <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel
                      header={
                        <Space>
                          <BugOutlined />
                          <Text strong>Detalles del Error</Text>
                        </Space>
                      }
                      key="1"
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Title level={5}>Error Message:</Title>
                          <Paragraph code copyable style={{ background: '#fff1f0', padding: '12px' }}>
                            {error.name}: {error.message}
                          </Paragraph>
                        </div>
                        {error.stack && (
                          <div>
                            <Title level={5}>Stack Trace:</Title>
                            <Paragraph code copyable style={{ background: '#f5f5f5', padding: '12px', maxHeight: '300px', overflow: 'auto' }}>
                              {error.stack}
                            </Paragraph>
                          </div>
                        )}
                      </Space>
                    </Panel>
                  </Collapse>
                </div>
              )}
            </Result>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Named export for RootProvider
export { ErrorBoundary };

// Default export for backwards compatibility
export default ErrorBoundary;

/**
 * Utility functions for CSV export
 */

import { Attendant } from '../interfaces';

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data: any[], headers: string[]): string => {
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

/**
 * Export attendants to CSV file
 */
export const exportAttendantsToCSV = (attendants: Attendant[], eventName: string = 'evento'): void => {
    if (attendants.length === 0) {
        alert('No hay asistentes para exportar');
        return;
    }

    // Prepare data
    const data = attendants.map(attendant => ({
        'Nombre': attendant.client.name,
        'Apellido': attendant.client.lastName,
        'Email': attendant.client.email,
        'Tipo de Ticket': attendant.type,
        'Precio': attendant.price,
        'Estado': attendant.status,
        'Fecha de Creación': new Date(attendant.client.createdAt).toLocaleString('es-ES')
    }));

    const headers = ['Nombre', 'Apellido', 'Email', 'Tipo de Ticket', 'Precio', 'Estado', 'Fecha de Creación'];
    const csv = arrayToCSV(data, headers);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `asistentes_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export scan history to CSV
 */
export const exportScanHistoryToCSV = (scanHistory: any[], eventName: string = 'evento'): void => {
    if (scanHistory.length === 0) {
        alert('No hay historial para exportar');
        return;
    }

    // Prepare data
    const data = scanHistory.map(scan => ({
        'Fecha/Hora': scan.timestamp ? new Date(scan.timestamp).toLocaleString('es-ES') : '-',
        'Estado': scan.access,
        'Razón': scan.reason,
        'Nombre': scan.name || '-',
        'Email': scan.email || '-',
        'Tipo': scan.type || '-',
        'Precio': scan.price || '-',
        'QR Code': scan.qrCode || '-'
    }));

    const headers = ['Fecha/Hora', 'Estado', 'Razón', 'Nombre', 'Email', 'Tipo', 'Precio', 'QR Code'];
    const csv = arrayToCSV(data, headers);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `historial_escaneos_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

import { Sale } from '../entities/Sale';
import { SaleId } from '../value-objects/SaleId';
import { TicketStatus } from '../value-objects/TicketStatus';

/**
 * ISalesRepository - Port (Interface)
 *
 * Define el contrato que debe implementar cualquier adaptador de persistencia.
 * El dominio NO conoce los detalles de implementación (MongoDB, PostgreSQL, etc.)
 *
 * Hexagonal Architecture: Port en el lado del dominio
 */
export interface ISalesRepository {
  /**
   * Guardar una venta
   */
  save(sale: Sale): Promise<void>;

  /**
   * Guardar múltiples ventas (batch)
   */
  saveMany(sales: Sale[]): Promise<void>;

  /**
   * Buscar venta por ID
   */
  findById(id: SaleId): Promise<Sale | null>;

  /**
   * Buscar venta por ID con datos de cliente y evento populados
   */
  findByIdWithDetails(id: SaleId, promoterId: string): Promise<Sale | null>;

  /**
   * Buscar venta por criterios específicos
   */
  findOne(params: {
    id: SaleId;
    clientId: string;
    status: TicketStatus;
  }): Promise<Sale | null>;

  /**
   * Obtener todas las ventas de un promotor
   */
  findByPromoter(promoterId: string): Promise<Sale[]>;

  /**
   * Obtener ventas de un evento
   */
  findByEvent(eventId: string): Promise<Sale[]>;

  /**
   * Obtener ventas en reventa de un evento
   */
  findResalesByEvent(eventId: string): Promise<Sale[]>;

  /**
   * Obtener ventas para acceso de un evento
   */
  findByEventForAccess(promoterId: string, eventId: string): Promise<Sale[]>;

  /**
   * Obtener invitaciones de un evento
   */
  findInvitationsByEvent(eventId: string, promoterId: string): Promise<Sale[]>;

  /**
   * Actualizar estado de múltiples ventas
   */
  updateManyStatus(params: {
    eventId: string;
    currentStatuses: TicketStatus[];
    newStatus: TicketStatus;
    historyEntry: {
      status: string;
      activity: string;
      description: string;
    };
  }): Promise<number>;

  /**
   * Verificar estado de ticket
   */
  checkTicketStatus(promoterId: string, saleId: SaleId): Promise<Sale | null>;
}

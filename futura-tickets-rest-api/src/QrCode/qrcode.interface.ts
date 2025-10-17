import { TicketStatus } from "src/shared/interface";

export interface PromoterMsg {
  event: string;
  owner: string;
  ticket: string;
  status: TicketStatus;
};
import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse'

interface Ticket {
  ticket_id: string;
  purchase_date: Date;
  price: string;
  customer_id: string;
  scan_date: Date;
  scanned_by: string;
  discount_id: string;
  source: string;
  referrer_id: string;
  discount_pct: string;
  event_id: string;
  event_start: Date;
  event_end: Date;
  brand_id: string;
  venue_id: string;
  city_id: string;
  flyer_url: string;
};

export interface CreateEvent {
  name: string;
  description: string;
  url?: string;
  image: string;
  capacity: number;
  price: number;
  resale: Resale;
  location: Location;
  dateTime: DateTime;
  conditions: string;
  isBlockchain: boolean;
};

export interface Resale {
  isResale: boolean;
  isActive: boolean;
  maxPrice: number;
  royalty: number;
};

export interface DateTime {
  launchDate: Date;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
};

const csvFilePath = path.resolve(__dirname, 'files/lux.csv');
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

const headers = ['ticket_id', 'purchase_date', 'price', 'customer_id', 'scan_date', 'scanned_by', 'discount_id', 'source', 'referrer_id', 'discount_pct', 'event_id', 'event_start', 'event_end', 'brand_id', 'venue_id', 'city_id', 'flyer_url'];

const events: string[] = [];

parse(fileContent, {
  delimiter: ',',
  columns: headers,
}, (error, result: Ticket[]) => {
  if (error) {
    console.error(error);
  }

  result.shift();

  console.log(result[0])

  result.forEach((item: Ticket) => {
    const eventFound = events.find((event: string) => event == item.event_id);
    if (!eventFound) events.push(item.event_id);
  });

  console.log(events);
  console.log(events.length);

});
import type { Ticket, TicketLot } from "@/app/shared/interface";

export interface Event {
  id: string;
  title: string;
  venue: string; 
  coordinates?: [number, number]; 
  date: Date;
  formattedDate: string;
  time: Date;
  price: number;
  image: string;
  country: string;
  city: string;
  genres: string[];
  description: string;
  organizer: string;
  address: string;
  capacity: number;
  organizerId?: any;
  faqs?: {
    title: string;
    description: string;
  }[];
  conditions?: {
    title: string;
    description: string;
  }[];
  tickets: Ticket[];
  ticketLots: TicketLot[];
  resale: {
    isResale: boolean;
    isActive: boolean;
    maxPrice: number;
    royalty: number;
  };
  artists: {
    name: string;
    image?: string;
  }[];
  orders?: any[];
  maxQuantity: number;
  commission: number;
  availableTickets: number;
  url: string;
};

export const genres = [
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Electronic",
  "Techno",
  "House",
  "Hip Hop",
  "R&B",
  "Latin",
  "Reggae",
  "Folk",
  "Country",
  "Metal",
  "Blues",
  "Acoustic",
  "Indie",
  "Alternative",
  "Dance",
  "Disco",
  "Funk",
  "Soul",
  "Punk",
  "Reggaeton",
  "Flamenco",
  "Cabaret",
  "Comedy",
  "Festival",
  "Food & Drink",
  "Theatre",
  "Retro",
  "Cultural",
  "Sports",
  "Winter",
  "Running",
  "Motorsport",
  "Traditional",
  "Technology",
  "Conference",
  "Finance",
  "Science",
  "Art",
  "Digital",
  "Exhibition",
  "Sculpture",
  "Photography",
  "Food",
  "Wine",
  "Educational",
  "Workshop",
  "Architecture",
  "Culinary",
  "Film",
  "Business",
  "Trade",
  "Expo",
  "Sustainability",
  "Fashion",
  "Luxury",
  "Contemporary",
  "Environmental",
  "Literary",
  "Fair",
  "Gaming",
  "eSports",
  "Wellness",
  "Retreat",
  "Mindfulness",
  "Space",
  "Beer",
  "Early Music",
  "Medieval",
  "Design",
  "Guitar",
  "Maritime",
  "Carnival",
  "Comics",
]


import type { Country } from "@/lib/countries-data";
import type { Stripe } from "@stripe/stripe-js";
import type { Event } from "@/lib/events-data";

export interface EventAPI {
	categories: any[];
	type: any;
	genres: never[];
	details:
		| {
				age: string;
				hours: string;
				venue: string;
				address: string;
				cityCode: string;
				membership: string;
		  }
		| undefined;
	_id: string;
	promoter: { _id: string; name: string };
	name: string;
	description: string;
	image: string;
	capacity: number;
	commission: number;
	resale: Resale;
	artists: Artist[];
	location: Location;
	dateTime: DateTime;
	conditions: Condition[];
	faqs: Faq[];
	isBlockchain: boolean;
	address: string;
	blockNumber: number;
	hash: string;
	url: string;
	orders: string[];
	status: EventStatus;
	tickets: Ticket[];
	ticketLots: TicketLot[];
	maxQuantity: number;
	availableTickets: number;
}

export interface CreateEvent {
	name: string;
	description: string;
	maxQuantity: number;
	capacity: number;
	artists: Artist[];
	url?: string;
	image: string;
	ticketImage: string;
	tickets: {
		type: string;
		capacity: number;
		price: number;
	}[];
	resale: Resale;
	location: Location;
	dateTime: DateTime;
	conditions: Condition[];
	isBlockchain: boolean;
}

export interface Condition {
	title: string;
	content: string;
}

export interface Faq {
	title: string;
	content: string;
}

export interface DateTime {
	launchDate: Date;
	startDate: Date;
	endDate: Date;
}

export interface UpdateEvent {
	dateTime?: {
		launchDate?: Date;
	};
	name?: string;
	capacity?: number;
	location?: Location;
	status?: EventStatus;
	tickets?: Ticket[];
}

export interface TransferToUpdate {
	blockNumber: number;
	hash: string;
	from: string;
	to: string;
	tokenId: number;
}

export interface ConfirmTransferTicket {
	isResale?: boolean;
}

export interface TransferToTicket {
	name: string;
	email: string;
	lastName: string;
	birthdate: string;
	phone?: string;
}

export interface Location {
	address: string;
	city: string;
	country: string;
	postalCode: string;
	venue: string;
	lat: number;
	lon: number;
}

export interface Expense {
	description: string;
	amount: number;
}

export interface Ticket {
	capacity: number;
	type: string;
	amount?: number;
	price: number;
	availableTickets: number;
}

export interface TicketLot {
	type: string;
	ticketLotItems: {
	  amount: number;
	  price: number;
	}[]
  }

export interface Resale {
	isResale: boolean;
	isActive: boolean;
	maxPrice: number;
	royalty: number;
}

export interface Artist {
	name: string;
	image: string;
}

export enum EventStatus {
	HOLD = "HOLD",
	CREATED = "CREATED",
	LAUNCHED = "LAUNCHED",
	LIVE = "LIVE",
	CLOSED = "CLOSED",
}

export enum TicketStatus {
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	OPEN = "OPEN",
	SALE = "SALE",
	SOLD = "SOLD",
	CLOSED = "CLOSED",
	TRANSFERED = "TRANSFERED",
	EXPIRED = "EXPIRED",
}

export enum TicketActivity {
	EXPIRED = "EXPIRED",
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	PROCESSED = "PROCESSED",
	GRANTED = "GRANTED",
	DENIED = "DENIED",
	TRANSFERING = "TRANSFERING",
	TRANSFERED = "TRANSFERED",
}

export interface ResaleTicket {
	client: {
		_id: string;
		name: string;
		lastName: string;
		email: string;
	};
	tickets: Array<{
		id: string;
		type: string;
		quantity: number;
	}>;
	_id: string;
	type: string;
	resale: {
		resalePrice: number;
		resaleDate: Date;
	};
	event: EventAPI;
	price: number;
	seller: string;
}

export interface PurchaseResaleResponse {
	success: boolean;
	message?: string;
	ticketId?: string;
}

export interface AuthResponse {
	token: string;
	user: {
		id: string;
		email: string;
	};
}

export interface CreateOrder {
	contactDetails?: ContactDetails;
	orders: {
		event: string;
		promoter: string;
		paymentId?: string;
		promoCode?: string;
		couponCode?: string;
		items: Item[];
		resaleItems: Item[];
	}[];
}

export interface CreateOrderItems {

		event: string;
		promoter: string;
		paymentId?: string;
		promoCode?: string;
		couponCode?: string;
		items: Item[];
		resaleItems: Item[];

}

export interface Item {
	sale?: string;
	type: string;
	amount: number;
	price: number;
}

export interface ContactDetails {
	name: string;
	lastName: string;
	birthdate: Date;
	email: string;
	phone?: string;
}
export interface Commission {
	commission: number;
	type: string;
	description?: string;
}

export interface Order {
	_id: string;
	event: Event | EventAPI;
	tickets: Ticket[];
	total: number;
	createdAt: string;
	status: string;
	sales?: Sale[];
	items?: Item[];  // For admin analytics compatibility
	contactDetails?: ContactDetails;  // For admin orders compatibility
}

interface Sale {
	qrCode: string;
	_id?: string;
	amount?: number;
	date?: string;
	method?: string;
	status?: string;
	reference?: string;
}

export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
	PROMOTER = "PROMOTER",
	ACCESS = "ACCESS",
}

export interface UserData {
	_id?: string;
	name: string;
	lastName: string;
	email: string;
	phone?: string;
	address?: string;
	avatar?: string;
	birthdate?: string;
	password?: string;
	createdAt?: string;
	orders?: Order[];
	role?: UserRole;
}

export interface Account {
	_id?: string;
	account: string;
	name: string;
	lastName: string;
	email: string;
	phone?: string;
	gender?: string;
	birthdate?: Date;
	avatar?: string;
	password?: string;
	token?: string;
	createdAt: Date;
	accessPass?: string;
}

export interface TicketDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	order: Order;
}

export interface ContactProps {
  onSubmit: (formData: ContactFormData) => void;
  isProcessing: boolean;
  isFormLocked: boolean;
  initialData?: ContactFormData | null;
}

export interface ContactFormData {
	firstName: string;
	lastName: string;
	email: string;
	day?: string;
	month?: string;
	year?: string;
	phone: string;
}

export interface FiltersProps {
	dateFilter: string;
	setDateFilter: (value: string) => void;
	genreFilters: string[];
	setGenreFilters: (value: string[]) => void;
	venueFilters: string[];
	setVenueFilters: (value: string[]) => void;
	artistFilters: string[];
	setArtistFilters: (value: string[]) => void;
	priceRange: { min: number; max: number | null };
	setPriceRange: (value: { min: number; max: number | null }) => void;
	selectedCity: string;
	setSelectedCity: (value: string) => void;
	citiesByCountry: string[];
	genresByCountry: string[];
	artistsByCountry: string[];
	venuesByCountry: string[];
	maxEventPrice: number;
}

export interface ExploreCountriesProps {
	availableCountries: Country[];
	currentCountry: string;
	countriesWithEvents: string[];
	countryImages: Record<string, string>;
	onCountrySelect: (country: string) => void;
	isLoading: boolean;
}

export interface FeaturedEventsProps {
	events: Event[];
	isLoading: boolean;
}

export interface PopularEventsProps {
	events: Event[];
	country: string;
	isLoading: boolean;
}

export interface EventCardProps {
	event: Event;
	onViewDetails?: (event: Event) => void;
	showActions?: boolean;
}
export interface EventsGridProps {
	isLoading: boolean;
	events: Event[];
	onViewDetails: (event: Event) => void;
	searchTerm: string;
	onClearSearch: () => void;
	onClearFilters: () => void;
}
// Interfaces para OrderDetailsDisplay
export interface ContactDetails {
	name: string;
	lastName: string;
	email: string;
	phone?: string;
}

export interface OrderItem {
	type: string;
	amount: string | number;
	price: string | number;
}

export interface OrderPayload {
	paymentId: string;
	createdAt: string;
	updatedAt: string;
	status: string;
	contactDetails?: ContactDetails;
	event: EventAPI;
	items: OrderItem[];
	commission?: number;
}

export interface OrderDetailsDisplayProps {
	orderDetails: OrderPayload[];
	formatDate: (dateString: string) => string;
	router: any;
}

export interface CartEvent {
	id: string;
	title: string;
	formattedDate: string;
	image: string;
	organizer: string;
	venue: string;
	date: Date;
	time: Date;
	price: number;
	country: string;
	city: string;
	address: string;
	capacity: number;
	maxQuantity: number;
	commission: number;
	organizerId: string;
	availableTickets: number;
	url: string;
	tickets: {
		type: string;
		price: number;
		capacity: number;
	}[];
	resale?: {
		isResale: boolean;
		isActive: boolean;
		maxPrice: number;
		royalty: number;
	};
	artists: string[];
}

export interface PaymentProps {
	paymentId: string;
	clientSecret: string;
	stripePromise: Promise<Stripe>;
}

export interface NewUserInfo {
	name: string;
	lastName: string;
	email: string;
	phone?: string;
	birthdate: string;
}

// Coupon and PromoCode interfaces
export enum CouponType {
	PERCENTAGE = "PERCENTAGE",
	FIXED_AMOUNT = "FIXED_AMOUNT",
	TWO_FOR_ONE = "2X1"
}

export interface Coupon {
	_id: string;
	code: string;
	type: CouponType;
	discount: number; // percentage or fixed amount
	eventId?: string; // null = global coupon
	event?: EventAPI;
	maxUses: number;
	usedCount: number;
	maxUsesPerUser: number;
	startDate: Date;
	expirationDate: Date;
	isActive: boolean;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateCoupon {
	code: string;
	type: CouponType;
	discount: number;
	eventId?: string;
	maxUses: number;
	maxUsesPerUser: number;
	startDate: Date;
	expirationDate: Date;
	isActive: boolean;
	description?: string;
}

export interface PromoCode {
	_id: string;
	code: string;
	eventId?: string;
	event?: EventAPI;
	isActive: boolean;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreatePromoCode {
	code: string;
	eventId?: string;
	isActive: boolean;
	description?: string;
}

// Review and Rating interfaces
export interface Review {
	_id: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	eventId: string;
	eventName: string;
	rating: number; // 1-5 stars
	comment: string;
	createdAt: Date;
	updatedAt?: Date;
	helpful: number; // number of users who found it helpful
	isVerifiedPurchase: boolean;
	status: ReviewStatus;
}

export enum ReviewStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED"
}

export interface CreateReview {
	eventId: string;
	rating: number;
	comment: string;
}

export interface UpdateReview {
	rating?: number;
	comment?: string;
}
import { Body, Controller, Get, Post, Put, Delete, Param, Res } from '@nestjs/common';
import { Response } from 'express';

// SERVICES
import { EventService } from './event.service';
import { PromocodesService } from './promocode.service';

// INTERFACES
import { Event, Coupon, Promocode } from 'src/shared/interface';
import { CreateOrder } from 'src/Orders/orders.interface';

@Controller('/events')
export class EventController {

    constructor(
        private eventService: EventService,
        private promocodeService: PromocodesService,
    ) {}

    @Get('/')
    async getEvents(): Promise<Event[]> {
        return await this.eventService.getOpenEvents();
    }

    @Get('/all')
    async getAllEvents(): Promise<Event[]> {
        return await this.eventService.getAllEvents();
    }

    @Post('/')
    async createEvent(@Body() eventData: Partial<Event>): Promise<Event> {
        return await this.eventService.createEvent(eventData);
    }

    @Put('/:eventId')
    async updateEvent(
        @Param('eventId') eventId: string,
        @Body() eventData: Partial<Event>
    ): Promise<Event | null> {
        return await this.eventService.updateEvent(eventId, eventData);
    }

    @Delete('/:eventId')
    async deleteEvent(@Param('eventId') eventId: string): Promise<Event | null> {
        return await this.eventService.deleteEvent(eventId);
    }

    @Get('/:eventUrl')
    async getEventByUrl(@Param('eventUrl') eventUrl: string): Promise<Event | null> {
       return await this.eventService.getEventsByUrl(eventUrl);
    }

    @Post('/create-order')
    async createOrder(@Body('createOrder') createOrder: CreateOrder): Promise<{ paymentId: string; clientSecret: string } | undefined> {
        try {
            return await this.eventService.createOrder(createOrder);
        } catch (error) {
            console.log(error);
        }
    };

    @Get('/coupon/:code')
    async getCouponInfo(@Param('code') code: string): Promise<Coupon | { discount: number} | null> {
        const discount = await this.eventService.getCoupon(code);
        if (!discount) {
            return { discount: 0 };
        } else {
            return discount;
        }
    }

    @Get('/promocode/:code')
    async getPromocodeInfo(@Param('code') code: string): Promise<Promocode | null> {
        return await this.promocodeService.getEventByPromocode(code);
    }

}
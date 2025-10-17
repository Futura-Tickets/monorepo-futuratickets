import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

// MONGOOSE
import { DeleteResult } from 'mongoose';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { EventService } from './event.service';
import { PromoterPipeService } from 'src/Promoter/promoter.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { Event, CreateEvent, UpdateEvent } from '../shared/interface';
 
interface RequestWithRawBody extends Request {
  rawBody: Buffer;
};
 
export default RequestWithRawBody;

@Controller('/events')
export class EventController {

    constructor(
        private eventService: EventService,
    ) {}

    @Post('/create')
    async createEvent(@Auth(PromoterPipeService) promoter: Account, @Body('createEvent') createEvent: CreateEvent): Promise<Event | undefined> {
        try {
            return await this.eventService.createEvent(createEvent, promoter);    
        } catch (error) {
            console.log(error);
        }
    };

    @Get()
    async getEvents(@Auth(PromoterPipeService) promoter: Account): Promise<Event[]> {
        return await this.eventService.getEvents(promoter.promoter!);
    };

    @Get('/:eventId')
    async getEvent(@Auth(PromoterPipeService) promoter: Account, @Param('eventId') eventId: string): Promise<Event | null> {
        return await this.eventService.getEvent(promoter.promoter!, eventId);
    };

    @Get('/creator/:creator')
    async getEventsByCreator(@Auth(PromoterPipeService) promoter: Account, @Param('creator') creator: string): Promise<Event[]> {
        return await this.eventService.getEventsByCreator(promoter.promoter!, creator);
    };

    @Patch('/:eventId')
    async updateEvent(@Auth(PromoterPipeService) promoter: Account, @Param('eventId') eventId: string, @Body('updateEvent') updateEvent: UpdateEvent): Promise<void | undefined> {
        try {
            await this.eventService.updateEvent(eventId, promoter.promoter!, updateEvent);
        } catch (error) {
            console.log(error);
        }
    };

    @Delete('/:eventId')
    async deleteEvent(@Auth(PromoterPipeService) promoter: Account, @Param('eventId') eventId: string): Promise<DeleteResult> {
        return this.eventService.deleteEvent(promoter.promoter!, eventId);
    };

};
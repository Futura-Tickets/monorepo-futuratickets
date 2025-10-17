import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { OrdersService } from './orders.service';
import { UserPipeService } from 'src/Account/account.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { Order } from './orders.interface';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {

    constructor(
        private ordersService: OrdersService
    ) {}

    @Get('/config')
    @ApiOperation({
        summary: 'Get Stripe configuration',
        description: 'Returns the Stripe publishable key for client-side payment processing.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Stripe configuration retrieved successfully.',
        schema: {
            type: 'object',
            properties: {
                config: { type: 'string', description: 'Stripe publishable key' }
            }
        }
    })
    getOrderConfig(): { config: string; } {
        return { config: this.ordersService.getOrderConfig() };
    };

    @Get('/paymentId/:paymentId')
    async getOrdersByPaymentId(@Param('paymentId') paymentId: string): Promise<Order[]> {
        return await this.ordersService.getOrdersByPaymentId(paymentId);
    }

    @Get('/profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get user orders',
        description: 'Retrieve all orders for the authenticated user including ticket details.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User orders retrieved successfully.',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token.',
    })
    async getAccountOrders(@Auth(UserPipeService) user: Account): Promise<Order[]> {
        return await this.ordersService.getAccountOrders(user._id);
    }

    @Get('/')
    @ApiOperation({
        summary: 'Get all orders',
        description: 'Retrieve all orders in the system.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'All orders retrieved successfully.',
    })
    async getAllOrders(): Promise<Order[]> {
        return await this.ordersService.getAllOrders();
    }

};
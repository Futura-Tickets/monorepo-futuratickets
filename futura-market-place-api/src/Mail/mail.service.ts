import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

// BULL
import { Job, Queue } from 'bull';

// MAILER
import { MailerService } from '@nestjs-modules/mailer';

// SERVICES
import { AuthService } from 'src/Auth/services/auth.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { CreatedTicket, Event } from 'src/shared/interface';
import { Order } from 'src/Orders/orders.interface';
import { Sale } from 'src/Sales/sales.interface';
import { TransferFromEmail, TransferToEmail } from './mail.interface';

@Injectable()
export class MailService {

    private blobUrl: string;
    private marketPlaceUrl: string;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
    //@InjectQueue('new-order-mail') private newOrderMailQueue: Queue,
    @InjectQueue('ticket-resale-mail') private ticketResaleQueue: Queue,
    @InjectQueue('ticket-transfer-from-mail') private ticketTransferFromMailQueue: Queue,
    @InjectQueue('ticket-transfer-to-mail') private ticketTransferToMailQueue: Queue,
    @InjectQueue('new-account-mail') private newAccountMailQueue: Queue,
    @InjectQueue('recover-account-mail') private recoverAccountMailQueue: Queue,
  ) {
    this.blobUrl = configService.get('BLOB_URL') as string;
    this.marketPlaceUrl = configService.get('FUTURA_MARKET_PLACE') as string;
  }

  public async sendOrderConfirmation(order: Order): Promise<void> {

    const account = (order.account as unknown as Account);

    const registerToken = await this.authService.registerToken({
      account: account._id,
      name: account.name,
      lastName: account.lastName,
      promoter: account.promoter,
      role: account.role,
      email: account.email,
      address: account.address
    });

    let totalAmount = 0;
    let orders = '';
    
    (order.sales as unknown as Sale[]).forEach((sale: Sale) => {
        totalAmount += sale.price;
        orders += `
            <tr>
            <td class="order-item">${sale.type}</td>
            <td class="order-item"><span class="amount">${sale.price} EUR</span></td>
            </tr>`;
    });

    totalAmount += totalAmount * (order.commission / 100);

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                    <td class="image">
                      <img src="${this.blobUrl}/${(order.event as unknown as Event).image}"/>
                    </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                            <tr>
                              <td>
                                <h1>${(order.event as unknown as Event).name}</h1>
                                <p>Your order has been processed correctly!<br/>Please find your order details below.<br/> Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                <h2>Order Confirmation:</h2>
                              </td>
                            </tr>
                          </table>
                          <table class="order">
                            ${orders}
                          </table>
                          <table class="order-total">
                            <tr>
                              <td class="order-item">Total Amount:</td>
                              <td class="order-item"><span class="amount">${totalAmount} EUR</span></td>
                            </tr>
                          </table>
                          <table class="check-tickets">
                            <tr>
                              <td>
                                <a href="${this.marketPlaceUrl}/account?token=${registerToken}" class="check-tickets-btn" target="_blank">Check Tickets</a>
                              </td>
                            </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: (order.account as unknown as Account).email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - New Order ${order._id}`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Order sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

  public async sendResaleConfirmation(sale: Sale, price: number): Promise<void> {

    const account = (sale.client as unknown as Account);

    const registerToken = await this.authService.registerToken({
      account: account._id,
      name: account.name,
      lastName: account.lastName,
      promoter: account.promoter,
      role: account.role,
      email: account.email,
      address: account.address
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                      <td class="image">
                          <img src="${this.blobUrl}/${(sale.event as unknown as Event).image}"/>
                      </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                              <tr>
                                  <td>
                                      <h1>Futura Event V2</h1>
                                      <p>Your ticket #${sale.tokenId} was correctly placed for resale with a resale price of ${price} EUR.</p>
                                      <p>Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: (sale.client as unknown as Account).email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Resale Confirmation #${sale.tokenId}`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Resale email confirmation sent!')
    }).catch((err) => {
      console.log(err);
      console.log('Error sending Resale email confirmation!')
    });

  }

  public async sendCancelResaleConfirmation(sale: Sale): Promise<void> {

    const account = (sale.client as unknown as Account);

    const registerToken = await this.authService.registerToken({
      account: account._id,
      name: account.name,
      lastName: account.lastName,
      promoter: account.promoter,
      role: account.role,
      email: account.email,
      address: account.address
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                      <td class="image">
                          <img src="${this.blobUrl}/${(sale.event as unknown as Event).image}"/>
                      </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                              <tr>
                                  <td>
                                      <h1>Futura Event V2</h1>
                                      <p>Your ticket ${sale.tokenId} was canceled for resale.</p>
                                      <p>Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: (sale.client as unknown as Account).email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Resale Confirmation #${sale.tokenId}`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Order sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error sending order!')
    });

  }

  public async sendTicketSoldConfirmation(createdTicket: CreatedTicket | Sale, price?: number): Promise<void> {
    // Extract account from either CreatedTicket or Sale
    const account = 'client' in createdTicket && createdTicket.client
      ? (createdTicket.client as unknown as Account)
      : (createdTicket as any).client as Account;

    const registerToken = await this.authService.registerToken({
      account: account._id,
      name: account.name,
      lastName: account.lastName,
      promoter: account.promoter,
      role: account.role,
      email: account.email,
      address: account.address
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                      <td class="image">
                          <img src="${this.blobUrl}/${(createdTicket.event as unknown as Event).image}"/>
                      </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                              <tr>
                                  <td>
                                      <h1>${(createdTicket.event as unknown as Event).name}</h1>
                                      <p>Your ticket #${createdTicket.tokenId} was sold correctly, you will receive your funds soon.</p>
                                      <p>Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: (createdTicket.client as unknown as Account).email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Ticket sold`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Ticket sold sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error sending ticket sold!')
    });

  }

  public async sendTransferFromConfirmation(transferFromEmail: TransferFromEmail): Promise<void> {

    const registerToken = await this.authService.registerToken({
      account: transferFromEmail.account._id,
      name: transferFromEmail.account.name,
      lastName: transferFromEmail.account.lastName,
      promoter: transferFromEmail.account.promoter,
      role: transferFromEmail.account.role,
      email: transferFromEmail.account.email,
      address: transferFromEmail.account.address
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                      <td class="image">
                          <img src="${this.blobUrl}/${transferFromEmail.event.image}"/>
                      </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                              <tr>
                                  <td>
                                      <h1>${transferFromEmail.event .name}</h1>
                                      <p>Your ticket #${transferFromEmail.ticket.tokenId} has been transfered to ${transferFromEmail.transferToAccount.email}.</p>
                                      <p>Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: transferFromEmail.account.email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Ticket Transfer`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Ticket transfer from sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

  public async sendTransferToConfirmation(transferToEmail: TransferToEmail): Promise<void> {

    const registerToken = await this.authService.registerToken({
      account: transferToEmail.account._id,
      name: transferToEmail.account.name,
      lastName: transferToEmail.account.lastName,
      promoter: transferToEmail.account.promoter,
      role: transferToEmail.account.role,
      email: transferToEmail.account.email,
      address: transferToEmail.account.address
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                      <td class="image">
                        <img src="${this.blobUrl}/${transferToEmail.event.image}" style="width:100%"/>
                      </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                              <tr>
                                  <td>
                                      <h1>${transferToEmail.event.name}</h1>
                                      <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">
                                        You have received a new ticket from ${transferToEmail.transferFromAccount.email}.
                                        <br/>
                                        Enjoy the event!
                                      </p>
                                      <div style="display:flex; align-items: center; font-size: 16px; font-weight: bold; border-top: 1px solid #efefef; padding: 2.5rem;">${transferToEmail.ticket.type}, ${transferToEmail.ticket.price} EUR</div>
                                      <a href="${this.marketPlaceUrl}/account?token=${registerToken}" style="font-size: 18px;">View ticket</a>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: transferToEmail.account.email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Ticket Transfer`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Ticket transfer to sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

  public async sendInvitationToConfirmation(order: Order): Promise<void> {

    const account = (order.account as unknown as Account);

    const registerToken = await this.authService.registerToken({
      account: account._id,
      name: account.name,
      lastName: account.lastName,
      promoter: account.promoter,
      role: account.role,
      email: account.email,
      address: account.address
    });

    let orders = '';
    
    (order.sales as unknown as Sale[]).forEach((sale: Sale) => {
      orders += `
        <tr>
          <td class="order-item">${sale.type}</td>
          <td class="order-item"><span class="amount">${sale.price} EUR</span></td>
        </tr>`;
    });

    const template = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <title>Futura Tickets - Order Confirmation</title>
              <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
          </head>
          <body>
              <table class="main">
                  <tr>
                    <td class="image">
                      <img src="${this.blobUrl}/${(order.event as unknown as Event).image}"/>
                    </td>
                  </tr>
                  <tr>
                      <td class="content">
                          <table>
                            <tr>
                              <td>
                                <h1>${(order.event as unknown as Event).name}</h1>
                                <p>Your invitation has been processed correctly!<br/>Please find your invitation details below.<br/> Please <a href="${this.marketPlaceUrl}/account?token=${registerToken}" target="_blank">visit your account</a> to check the status of your tickets.</p>
                                <h2>Invitation Confirmation:</h2>
                              </td>
                            </tr>
                          </table>
                          <table class="order">
                            ${orders}
                          </table>
                          <table class="order-total">
                            <tr>
                              <td class="order-item">Total Amount:</td>
                              <td class="order-item"><span class="amount">0 EUR</span></td>
                            </tr>
                          </table>
                          <table class="check-tickets">
                            <tr>
                              <td>
                                <a href="${this.marketPlaceUrl}/account?token=${registerToken}" class="check-tickets-btn" target="_blank">Check Tickets</a>
                              </td>
                            </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td class="footer">
                          <table>
                              <td class="footer-item">
                                  <img src="${this.blobUrl}/futura-tickets-white.png"/>
                              </td>
                              <td class="footer-item"></td>
                              <td class="footer-item">
                                  <table>
                                      <tr>
                                          <td>Need help?</td>
                                      </tr>
                                      <tr>
                                          <td>support@futuratickets.com</td>
                                      </tr>
                                  </table>
                              </td>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: (order.account as unknown as Account).email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - New Invitation ${order._id}`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Invitation sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

  public async sendAccountConfirmation(accountConfirmation: Account, password: string): Promise<void> {

    const registerToken = await this.authService.registerToken({
        account: accountConfirmation._id,
        name: accountConfirmation.name,
        lastName: accountConfirmation.lastName,
        promoter: accountConfirmation.promoter,
        role: accountConfirmation.role,
        email: accountConfirmation.email,
        address: accountConfirmation.address
    });

    const template = `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                <style media="all" type="text/css">
                  body {
                      margin: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                          sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: #000;
                      background-color: #f6f8fc;
                  }
                  table {
                      width: 100%;
                      border-spacing: 0px;
                  }
                  h1, h2 {
                      margin: 0;
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                  }
                  h1 {
                      font-size: 28px;
                      margin: 0 0 24px 0;
                  }
                  h2 {
                      font-size: 21px;
                      margin: 50px 0 25px 0;
                  }
                  p {
                      text-align: center;
                      font-size: 20px;
                      line-height: 32px;
                      font-weight: 400;
                  }
                  tr, td {
                      padding: 0;
                      margin: 0;
                      border-spacing: 0px;
                  }
                  td {
                      border-spacing: 0px;
                  }
                  .main {
                      max-width: 600px;
                      width: 100%;
                      margin: 0 auto;
                  }
                  .image img { width: 100%; }
                  .content {
                      padding: 50px;
                      background-color: white;
                  }
                  .order {
                      width: 100%;
                  }
                  .order td {
                      background: #f8f8f8;
                      border-spacing: 2px;
                      border-bottom: 4px solid white;
                  }
                  .order-item {
                      padding: 25px;
                      width: 50%;
                      font-size: 18px;
                  }
                  .amount {
                      font-weight: 600;
                      font-style: oblique;
                  }
                  .order-total {
                      width: 100%;
                  }
                  .order-total-item {
                      padding: 25px;
                  }
                  .check-tickets {
                      margin: 50px 0;
                  }
                  .check-tickets td {
                      text-align: center;
                  }
                  .check-tickets-btn {
                      text-transform: uppercase;
                      font-style: oblique;
                      text-align: center;
                      font-size: 18px;
                      background: #00948a;
                      border-radius: 8px;
                      padding: 10px 18px;
                      font-weight: 600;
                      text-decoration: none;
                      color: white !important;
                  }
                  .footer {
                      padding: 50px;
                      background-color: #00948a;
                      color: white;
                  }
                  .footer-item img {
                      width: 120px;
                  }
              </style>
            </head>
            <body>
                <table class="main">
                    <tr>
                        <td class="content">
                            <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Account Confirmation</h1>
                            <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">
                                Welcome to Futura Tickets! Your account has been created successfully.
                                <br/><br/>
                                User: ${accountConfirmation.email}
                                <br/><br/>
                                Please use the link below to set your password and activate your account.
                            </p>
                            <a href="${this.marketPlaceUrl}/account?token=${registerToken}" class="check-tickets-btn" target="_blank">Check Account</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <table>
                                <td class="footer-item">
                                    <img src="${this.blobUrl}/futura-tickets-white.png"/>
                                </td>
                                <td class="footer-item"></td>
                                <td class="footer-item">
                                    <table>
                                        <tr>
                                            <td>Need help?</td>
                                        </tr>
                                        <tr>
                                            <td>support@futuratickets.com</td>
                                        </tr>
                                    </table>
                                </td>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>`;

    await this.mailerService.sendMail({
        to: accountConfirmation.email,
        from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
        subject: `Futura Tickets - Account Confirmation`, // Subject line
        html: template // HTML body content
    }).then(() => {
        console.log('Account confirmation sent!')
    }).catch((err) => {
        console.log(err);
        console.log('error!')
    });
  }

  public async sendRecoverAccount(recoverAccount: Account): Promise<void> {

    const registerToken = await this.authService.registerToken({
        account: recoverAccount._id,
        name: recoverAccount.name,
        lastName: recoverAccount.lastName,
        promoter: recoverAccount.promoter,
        role: recoverAccount.role,
        email: recoverAccount.email,
        address: recoverAccount.address
    });

    const template = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <meta name="x-apple-disable-message-reformatting">
          <title></title>
          <style media="all" type="text/css">
            body {
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                    sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                color: #000;
                background-color: #f6f8fc;
            }
            table {
                width: 100%;
                border-spacing: 0px;
            }
            h1, h2 {
                margin: 0;
                text-transform: uppercase;
                font-style: oblique;
                text-align: center;
            }
            h1 {
                font-size: 28px;
                margin: 0 0 24px 0;
            }
            h2 {
                font-size: 21px;
                margin: 50px 0 25px 0;
            }
            p {
                text-align: center;
                font-size: 20px;
                line-height: 32px;
                font-weight: 400;
                margin: 30px 0;
            }
            tr, td {
                padding: 0;
                margin: 0;
                border-spacing: 0px;
            }
            td {
                border-spacing: 0px;
            }
            .main {
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
            }
            .image img { width: 100%; }
            .content {
                padding: 50px;
                background-color: white;
            }
            .recover-account-btn {
                text-transform: uppercase;
                font-style: oblique;
                text-align: center;
                font-size: 18px;
                background: #00948a;
                border-radius: 8px;
                padding: 10px 18px;
                font-weight: 600;
                text-decoration: none;
                color: white !important;
            }
            .footer {
                padding: 50px;
                background-color: #00948a;
                color: white;
            }
            .footer-item img {
                width: 120px;
            }
          </style>
        </head>
        <body>
            <table class="main">
                <tr>
                    <td class="content">
                        <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Recover your account</h1>
                        <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">
                          Click on the link to recover your account.
                        </p>
                        <p><a href="${this.marketPlaceUrl}/recover-account?token=${registerToken}" class="recover-account-btn">Recover account</a></p>
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        <table>
                            <td class="footer-item">
                                <img src="${this.blobUrl}/futura-tickets-white.png"/>
                            </td>
                            <td class="footer-item"></td>
                            <td class="footer-item">
                                <table>
                                    <tr>
                                        <td>Need help?</td>
                                    </tr>
                                    <tr>
                                        <td>support@futuratickets.com</td>
                                    </tr>
                                </table>
                            </td>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
      </html>`;

    await this.mailerService.sendMail({
      to: recoverAccount.email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Recover your account`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Recover account sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

  public async verifyAccount(account: Account): Promise<void> {

    const template = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <meta name="x-apple-disable-message-reformatting">
          <title></title>
          <style>
          </style>
        </head>
        <body>
          <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Verify your account</h1>
          <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">
            Click on the link to verify your account.
          </p>
          <a href="${this.marketPlaceUrl}/verify-account" style="font-size: 18px;">Verify account</a>
        </body>
      </html>`;

    await this.mailerService.sendMail({
      to: account.email,
      from: 'Futura Tickets <noreply@futuratickets.com>', // sender address
      subject: `Futura Tickets - Verify your account`, // Subject line
      html: template // HTML body content
    }).then(() => {
      console.log('Verify account sent!')
    }).catch((err) => {
      console.log(err);
      console.log('error!')
    });

  }

//   public async addNewOrderMailQueue(order: Order): Promise<Job<{order: Order }>> {
//     return this.newOrderMailQueue.add({ order });
//   };

  public async addTicketTransferFromMailQueue(transferFromEmail: TransferFromEmail): Promise<Job<{ transferFromEmail: TransferFromEmail }>> {
    return this.ticketTransferFromMailQueue.add({ transferFromEmail });
  };

  public async addTicketResaleMailQueue(sale: Sale, price: number): Promise<Job<{ sale: Sale, price: number }>> {
    return this.ticketResaleQueue.add({ sale, price });
  };

  public async addTicketTransferToMailQueue(transferToEmail: TransferToEmail): Promise<Job<{ transferToEmail: TransferToEmail }>> {
    return this.ticketTransferToMailQueue.add({ transferToEmail });
  };

  public async addNewAccountConfirmationMailQueue({newAccount, password}: {newAccount: Account, password: string}): Promise<Job<{newAccount: Account, password: string }>> {
    return this.newAccountMailQueue.add({ newAccount, password });
  };

  public async addRecoverAccountMailQueue(recoverAccount: Account): Promise<Job<{ recoverAccount: Account }>> {
    return this.recoverAccountMailQueue.add(recoverAccount);
  };

}
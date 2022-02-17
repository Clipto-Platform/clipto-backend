import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from './types';

export const Messages = {
  NewRequest: 'You have a new clip request',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  async notify(user: string, notification: Notification) {
    this.server.emit(`/notification/${user}`, {
      ...notification,
      timestamp: Date.now(),
    });
  }
}

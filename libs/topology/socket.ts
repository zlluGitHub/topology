import { Pen, EventType } from './models';

export class Socket {
  socket: WebSocket;
  constructor(public url: string, public pens: Pen[]) {
    this.init();
  }

  init() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.onmessage;

    this.socket.onclose = () => {
      console.log('Canvas websocket closed and reconneting...');
      this.init();
    };
  }

  onmessage = (e: MessageEvent) => {
    if (!this.pens.length || !e || !e.data) {
      return;
    }

    try {
      const msg: { event: string, data: any; } = JSON.parse(e.data);
      for (const item of this.pens) {
        for (const event of item.events) {
          if (event.type === EventType.WebSocket && event.name === msg.event) {
            item.doSocket(event, msg.data);
          }
        }
      }
    } catch (error) {
    }
  };

  close() {
    this.socket.onclose = null;
    this.socket.close();
  }
}

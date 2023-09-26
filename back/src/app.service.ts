import { Injectable } from '@nestjs/common';
// import { networkInterfaces } from 'os';

@Injectable()
export class AppService {
  getHello(): string {
    // Piece of code to check the loadbalancer is working well
    // const netInterfaces = networkInterfaces();
    // const [{ address }] = Object.values(netInterfaces).flatMap((netInterface) =>
    //   netInterface.filter((prop) => prop.family === 'IPv4' && !prop.internal),
    // );
    // console.log(address);

    return 'Hello World!';
  }
}

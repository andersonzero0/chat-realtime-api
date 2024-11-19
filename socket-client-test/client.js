/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
const { io } = require('socket.io-client');

let last_user = 0;

function createClient(id_user) {
  try {
    const socket = io('http://192.168.1.105:3000/chat', {
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        id: id_user,
        token:
          id_user == '01'
            ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjRkOTcxOGQ1ZWNjNTZiMDM2MDFiMl8wMSIsImlhdCI6MTcyNTQ2NDYwMiwiZXhwIjoxNzI2NzYwNjAyfQ.ziHHd5AViJBJsQhu_Ro0oXwzX6rH-aonJj3Iq0cuLco'
            : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjRkOTcxOGQ1ZWNjNTZiMDM2MDFiMl8wMiIsImlhdCI6MTcyNTQ2NDQ3NCwiZXhwIjoxNzI2NzYwNDc0fQ.Kg1wMl1c9SdfF5QtsBaCsk9is4xBluI3QYzVidJ8ZYY',
      },
    });

    socket.on('connect', () => {
      console.log(`=>> id_user: ${id_user} connected to the WebSocket server`);
      if (Number(id_user) > last_user) last_user = Number(id_user);
    });

    socket.on('private-message', (data) => {
      console.log(
        `Time: ${new Date().getTime() - new Date(data.created_at).getTime()} ms`,
      );
      console.log('Message from server:', data.message.content);
    });

    socket.on('error-message', (data) => {
      console.error('Error:', data);
    });

    socket.on('disconnect', () => {
      console.log('Last user:', last_user);
      throw new Error('Disconnected from the WebSocket server: ', id_user);
      console.log('Disconnected from the WebSocket server');
    });

    // Evento de erro
    socket.on('connect_error', () => {
      console.log('Last user:', last_user);
      throw new Error('WebSocket connection error: ', id_user);
      console.error('WebSocket error');
    });
  } catch (error) {
    console.log('Last user:', last_user);
    console.error('Error:', error);
  }
}

function createClients(start, end) {
  for (let i = start; i <= end; i++) {
    createClient(i.toString().padStart(2, '0'));
  }
}

const test = 0;

function test1() {
  const salts = 50;

  let start = 1;
  let end = salts;
  let interval = 1000;

  setInterval(() => {
    createClients(start, end);
    start = end + 1;
    end += salts;
  }, interval);
}

function test2() {
  createClients(1, 2);
}

switch (test) {
  case 1:
    test1();
    break;
  case 2:
    test2();
    break;
  default:
    createClient('02');
    break;
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
const { io } = require('socket.io-client');

const URL = 'http://localhost:3000';
const MAX_CLIENTS = 1000;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

// array com varias possiveis mensagens com diferentes tamanhos
const messages = [
  'Hello',
  'Hello World',
  'Hello World, how are you?',
  "Hello World, how are you? I'm fine",
  "Hello World, how are you? I'm fine, thank you",
  "Hello World, how are you? I'm fine, thank you, and you?",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you?",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you?",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you?",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too",
  "Hello World, how are you? I'm fine, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you, and you? I'm fine too, thank you",
];

const users = [
  { userOne: '01', userTwo: '02' },
  { userOne: '03', userTwo: '04' },
  { userOne: '05', userTwo: '06' },
  { userOne: '07', userTwo: '08' },
  { userOne: '09', userTwo: '10' },
  { userOne: '11', userTwo: '12' },
  { userOne: '13', userTwo: '14' },
  { userOne: '15', userTwo: '16' },
  { userOne: '17', userTwo: '18' },
  { userOne: '19', userTwo: '20' },
  { userOne: '21', userTwo: '22' },
  { userOne: '23', userTwo: '24' },
  { userOne: '25', userTwo: '26' },
  { userOne: '27', userTwo: '28' },
  { userOne: '29', userTwo: '30' },
  { userOne: '31', userTwo: '32' },
  { userOne: '33', userTwo: '34' },
  { userOne: '35', userTwo: '36' },
  { userOne: '37', userTwo: '38' },
  { userOne: '39', userTwo: '40' },
  { userOne: '41', userTwo: '42' },
  { userOne: '43', userTwo: '44' },
  { userOne: '45', userTwo: '46' },
  { userOne: '47', userTwo: '48' },
  { userOne: '49', userTwo: '50' },
  { userOne: '51', userTwo: '52' },
  { userOne: '53', userTwo: '54' },
  { userOne: '55', userTwo: '56' },
  { userOne: '57', userTwo: '58' },
  { userOne: '59', userTwo: '60' },
  { userOne: '61', userTwo: '62' },
  { userOne: '63', userTwo: '64' },
  { userOne: '65', userTwo: '66' },
  { userOne: '67', userTwo: '68' },
  { userOne: '69', userTwo: '70' },
  { userOne: '71', userTwo: '72' },
  { userOne: '73', userTwo: '74' },
  { userOne: '75', userTwo: '76' },
  { userOne: '77', userTwo: '78' },
  { userOne: '79', userTwo: '80' },
  { userOne: '81', userTwo: '82' },
  { userOne: '83', userTwo: '84' },
  { userOne: '85', userTwo: '86' },
  { userOne: '87', userTwo: '88' },
  { userOne: '89', userTwo: '90' },
  { userOne: '91', userTwo: '92' },
  { userOne: '93', userTwo: '94' },
  { userOne: '95', userTwo: '96' },
  { userOne: '97', userTwo: '98' },
  { userOne: '99', userTwo: '100' },
];

// quero que crie um client a cada 10ms e

const createClient = () => {
  // random user
  const randomUser = Math.floor(Math.random() * users.length);
  const user = users[randomUser];

  const socketUser1 = io(URL, {
    transports: ['websocket'],
    auth: {
      id: user.userOne,
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1wcm9qZWN0IiwiaWQiOiI2NmE4MDM0N2I5OWVlNmMyODJjMGJkNDciLCJpYXQiOjE3MjIyODY5MzF9.YphBmKvb9aCFnJjCBuab3Twym-Js3ZSlnK-Yv7JpwjM',
    },
  });

  const socketUser2 = io(URL, {
    transports: ['websocket'],
    auth: {
      id: user.userTwo,
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1wcm9qZWN0IiwiaWQiOiI2NmE4MDM0N2I5OWVlNmMyODJjMGJkNDciLCJpYXQiOjE3MjIyODY5MzF9.YphBmKvb9aCFnJjCBuab3Twym-Js3ZSlnK-Yv7JpwjM',
    },
  });

  setInterval(async () => {
    try {
      const randomMessage1 = Math.floor(Math.random() * messages.length);
      const message1 = messages[randomMessage1];

      const randomMessage2 = Math.floor(Math.random() * messages.length);
      const message2 = messages[randomMessage2];

      await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1wcm9qZWN0IiwiaWQiOiI2NmE4MDM0N2I5OWVlNmMyODJjMGJkNDciLCJpYXQiOjE3MjIyODY5MzF9.YphBmKvb9aCFnJjCBuab3Twym-Js3ZSlnK-Yv7JpwjM',
        },
        body: JSON.stringify({
          id_sender: user.userOne,
          id_receiver: user.userTwo,
          message: {
            type: 'text',
            content: message1,
          },
        }),
      });

      await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1wcm9qZWN0IiwiaWQiOiI2NmE4MDM0N2I5OWVlNmMyODJjMGJkNDciLCJpYXQiOjE3MjIyODY5MzF9.YphBmKvb9aCFnJjCBuab3Twym-Js3ZSlnK-Yv7JpwjM',
        },
        body: JSON.stringify({
          id_sender: user.userTwo,
          id_receiver: user.userOne,
          message: {
            type: 'text',
            content: message2,
          },
        }),
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }, EMIT_INTERVAL_IN_MS);

  socketUser1.on('private message', () => {
    packetsSinceLastReport++;
  });

  socketUser2.on('private message', () => {
    packetsSinceLastReport++;
  });

  socketUser1.on('disconnect', (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  socketUser2.on('disconnect', (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`,
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);

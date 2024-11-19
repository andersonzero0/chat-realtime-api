/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
const { io } = require('socket.io-client');

let usersCount = 0;
let tentativesCount = 0;
let messagesCount = 0;
let errorsCount = 0;
let timeTotal = 0;

const amount_open_chats = 100;
const MINUTES = 1;

function createUserPairs(numPairs) {
  const userPairs = [];
  for (let i = 1; i <= numPairs * 2; i += 2) {
    userPairs.push({
      userOne: i.toString().padStart(2, '0'),
      userTwo: (i + 1).toString().padStart(2, '0'),
    });
  }
  return userPairs;
}

const URL = 'http://192.168.1.107:3000/chat';
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdC1wcm9qZWN0IiwiaWQiOiI2NmI0ZDk3MThkNWVjYzU2YjAzNjAxYjIiLCJpYXQiOjE3MjMxMjgxODd9.bVRU2cb7ZMNPod4-P-U_1yvJkfnxJHssm_-21wOi8E8';
const USER_PAIRS = createUserPairs(amount_open_chats);

const MESSAGES = [
  'Hello',
  'Hello World',
  'Hello World, how are you?',
  "Hello World, how are you? I'm fine",
  "Hello World, how are you? I'm fine, thank you",
];

const MAX_DURATION_MS = MINUTES * 60 * 1000;
const durationEnd = Date.now() + MAX_DURATION_MS;

const createClientPair = (userOne, userTwo) => {
  const socketUser1 = io(URL, {
    transports: ['websocket'],
    auth: {
      token: userOne.token,
    },
  });

  const socketUser2 = io(URL, {
    transports: ['websocket'],
    auth: {
      token: userTwo.token,
    },
  });

  socketUser1.on('private-message', () => {
    messagesCount++;
  });

  socketUser2.on('private-message', () => {
    messagesCount++;
  });

  const sendMessage = async (userOne, userTwo) => {
    try {
      const randomMessage =
        MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

      const time = new Date().getTime();

      await fetch('http://192.168.1.107:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${userOne.token}`,
        },
        body: JSON.stringify({
          receiver_id: userTwo.id,
          message: {
            type: 'text',
            content: randomMessage,
          },
        }),
      });

      const time2 = new Date().getTime();
      timeTotal += time2 - time;

      tentativesCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const randomMessage2 =
        MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

      const time3 = new Date().getTime();

      await fetch('http://192.168.1.107:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${userTwo.token}`,
        },
        body: JSON.stringify({
          receiver_id: userOne.id,
          message: {
            type: 'text',
            content: randomMessage2,
          },
        }),
      });

      const time4 = new Date().getTime();
      timeTotal += time4 - time3;

      tentativesCount++;
    } catch (error) {
      console.error(error);
      errorsCount++;
    }
  };

  const INTERVALS = [4500];

  const randomInterval =
    INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

  const intervalId = setInterval(() => {
    if (Date.now() > durationEnd) {
      clearInterval(intervalId);
      return;
    }

    sendMessage(userOne, userTwo);
  }, randomInterval);

  socketUser1.on('disconnect', (reason) => {
    console.log(`User ${userOne.id} disconnected due to ${reason}`);
  });

  socketUser2.on('disconnect', (reason) => {
    console.log(`User ${userTwo.id} disconnected due to ${reason}`);
  });
};

const startAllClientPairs = () => {
  USER_PAIRS.forEach(async ({ userOne, userTwo }) => {
    try {
      const responseOne = await fetch(
        `http://192.168.1.107:3000/auth/generate-token/${userOne}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
        },
      );

      const responseTwo = await fetch(
        `http://192.168.1.107:3000/auth/generate-token/${userTwo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
        },
      );

      const json = await responseOne.json();
      const tokenOne = json.token;

      const json2 = await responseTwo.json();
      const tokenTwo = json2.token;

      createClientPair(
        { id: userOne, token: tokenOne },
        { id: userTwo, token: tokenTwo },
      );
      usersCount += 2;
    } catch (error) {
      console.error(error);
    }
  });
};
startAllClientPairs();

const printReport = () => {
  const now = new Date().getTime();

  // porcentage of messages that were sent
  const messagesSentPorcentage = (messagesCount / tentativesCount || 0) * 100;

  console.log(
    `open chats: ${usersCount / 2} ; online users: ${usersCount} ; time+-: ${(timeTotal / tentativesCount).toFixed(2)}ms ; messages count: ${messagesCount}/${tentativesCount} ; porcetage of messages: ${messagesSentPorcentage.toFixed(2)}% ; time left: ${(
      (durationEnd - now) /
      1000
    ).toFixed(0)} seconds ; errors count: ${errorsCount}`,
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 1000);

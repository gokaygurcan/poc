// core modules
import { createServer } from 'net';

// node modules
import { hexy } from 'hexy';
import mitt from 'mitt';

// variables
const server = createServer();
const emitter = mitt();

server.on('connection', socket => {
  console.log('server::connection');

  socket.setNoDelay(true); // the nagle algorithm

  socket.on('data', data => {
    emitter.emit('send', { data });
    socket.emit('send', data);
  });

  socket.on('send', packet => {
    socket.write(packet);
    emitter.emit('send', { packet });
  });
});

server.listen(4000, () => console.log(`server::listen (4000)`));

emitter.on('send', e => console.log('send', e));

/*
// listen to an event
emitter.on('foo', e => console.log('foo', e));

// listen to all events
emitter.on('*', (type, e) => console.log(type, '*', e));

// fire an event
emitter.emit('foo', { a: 'b' });

// working with handler references:
function onFoo() {}
emitter.on('foo', onFoo); // listen
emitter.off('foo', onFoo); // unlisten
*/

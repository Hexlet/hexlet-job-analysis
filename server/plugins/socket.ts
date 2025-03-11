// https://github.com/ducktors/fastify-socket.io/blob/master/src/index.ts

import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Server, ServerOptions } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../../types/socket'
import { spawn } from 'node-pty'
import debug from 'debug'

// debug.enable('app')
//
// const debugLog = debug('app:socket')

// export type FastifySocketioOptions = Partial<ServerOptions> & {
//   preClose?: (done: Function) => void
// }

const fastifySocketIO: FastifyPluginAsync = fp(
  // eslint-disable-next-line @typescript-eslint/require-await
  async function (fastify, _opts) {
    // function defaultPreClose(done: Function) {
    //   (fastify).io.local.disconnectSockets(true)
    //   done()
    // }

    const options = {
      cors: {
        origin: 'http://localhost:5173',
      },
    } satisfies Partial<ServerOptions>

    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(fastify.server, options)
    fastify.decorate('io', io)

    io.on('connection', (socket) => {
      console.log('connection')
      if (socket.recovered) {
        return
      }

      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash'

      // Create a pseudo terminal
      const term = spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME ?? '/',
        env: process.env,
      })

      // socket.data.terminal = term

      term.onData((data) => {
        socket.emit('output', data)
      })

      socket.on('input', (data) => {
        term.write(data)
      })
      socket.emit('test', 'jopa')

      // socket.emit('noArg')
    })
    // fastify.addHook('preClose', (done) => {
    //   if (opts.preClose) {
    //     return opts.preClose(done)
    //   }
    //   return defaultPreClose(done)
    // })
    fastify.addHook('onClose', (fastify: FastifyInstance, done) => {
      void fastify.io.close()
      done()
    })
  },
)

export default fastifySocketIO

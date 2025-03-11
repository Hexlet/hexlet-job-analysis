import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { ManagerOptions, SocketOptions, io } from 'socket.io-client/debug'
import { IdeClientSocket } from '@/types/socket'

const XTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const socketRef = useRef<IdeClientSocket | null>(null)

  useEffect(() => {
    if (terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        // theme: {
        //   background: '#000000',
        //   foreground: '#ffffff',
        // },
      })
      termRef.current = terminal

      const fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)
      terminal.open(terminalRef.current)
      fitAddon.fit()

      const options: Partial<ManagerOptions & SocketOptions> = {
        autoConnect: false,
      }

      const host = 'ws://localhost:3000'
      const socket: IdeClientSocket = io(host, options)
      socketRef.current = socket

      socket.on('connect', () => {
        terminal.write('Connected to Terminal\r\n')
      })

      socket.on('output', (data) => {
        terminal.write(data)
      })

      terminal.onData((data) => {
        socket.emit('input', data)
      })

      socket.connect()
      terminal.focus()

      window.addEventListener('resize', () => fitAddon.fit())

      return () => {
        socket.close()
        terminal.dispose()
      }
    }
  }, [])

  return (
    <div className="w-100 h-100">
      <div className="w-100 h-100" ref={terminalRef} />
    </div>
  )
}

export default XTerminal

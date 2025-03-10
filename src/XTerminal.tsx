import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

const XTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const term = useRef<Terminal | null>(null)
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (terminalRef.current) {
      term.current = new Terminal({
        cursorBlink: true,
        // theme: {
        //   background: '#000000',
        //   foreground: '#ffffff',
        // },
      })

      const fitAddon = new FitAddon()
      term.current.loadAddon(fitAddon)
      term.current.open(terminalRef.current)
      fitAddon.fit()

      socket.current = new WebSocket('ws://localhost:3000/terminal')

      socket.current.onopen = () => {
        term.current?.write('Connected to Terminal\r\n')
      }

      socket.current.onmessage = (event) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        term.current?.write(event.data)
      }

      term.current.onData((data) => {
        socket.current?.send(data)
      })

      window.addEventListener('resize', () => fitAddon.fit())

      return () => {
        socket.current?.close()
        term.current?.dispose()
      }
    }
  }, [])

  return <div ref={terminalRef} />
}

export default XTerminal

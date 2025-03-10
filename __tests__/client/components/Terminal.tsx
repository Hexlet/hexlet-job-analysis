import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const TerminalComponent: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const term = useRef<Terminal | null>(null)
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (terminalRef.current) {
      term.current = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#000000',
          foreground: '#ffffff',
        },
      })

      const fitAddon = new FitAddon()
      term.current.loadAddon(fitAddon)
      term.current.open(terminalRef.current)
      fitAddon.fit()

      socket.current = new WebSocket('ws://localhost:3000')

      socket.current.onopen = () => {
        term.current?.write('Connected to Terminal\r\n')
      }

      socket.current.onmessage = (event) => {
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

  return <div ref={terminalRef} style={{ width: '100%', height: '400px', background: 'black' }} />
}

export default TerminalComponent

import './application.scss'

import ReactDOM from 'react-dom/client'
import XTerminal from './XTerminal'

localStorage.debug = '*'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<XTerminal />)

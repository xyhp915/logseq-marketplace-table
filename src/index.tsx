import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import '@blueprintjs/table/lib/css/table.css'
import './index.scss'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = createRoot(document.getElementById('root')!)
root.render(<App/>)

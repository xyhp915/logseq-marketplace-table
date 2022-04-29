import React, { Reducer, useReducer } from 'react'
import { Button, Card, ControlGroup, InputGroup } from '@blueprintjs/core'
import { DateRangeInput } from '@blueprintjs/datetime'

type appState = {
  q: string | undefined
  category: 'all' | 'themes' | 'plugins' | string
  dateRange: [Date | null, Date | null]
  loading: boolean
}

enum appActionsType {
  update = 'update'
}

const initialState: appState = {
  q: '',
  category: 'all',
  dateRange: [null, null],
  loading: false
}

const appReducer: Reducer<appState, { type?: appActionsType, payload?: any, [key: string]: any } & Partial<appState>> = (
  prevState,
  action
) => {
  switch (action.type) {
    case appActionsType.update:
      return Object.assign({}, prevState, action.payload)
    default:
      return Object.assign({}, prevState, action.payload || action)
  }
}

export function App () {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // @ts-ignore
  return (
    <main className={'app'}>
      <h1>
        Logseq plugins & themes
        <sup onClick={() => open('https://github.com/logseq/marketplace', '_blank')}>Marketplace</sup>
      </h1>

      {/* controls */}
      <section className="controls">
        <div className="l">
          {/*category*/}
          <div className="bp4-html-select bp4-large">
            <select className="bp4-large"
                    value={state.category?.toLowerCase()}
                    onChange={(e) => {
                      dispatch({ category: e.target.value?.toLowerCase() })
                    }}
            >
              {['All', 'Plugins', 'Themes'].map(it => {
                return <option value={it}>{it}</option>
              })}
            </select>
            <span className="bp4-icon bp4-icon-double-caret-vertical"></span>
          </div>

          {/*  date range*/}
          <Button
            large={true}
            minimal={true}
            style={{ margin: '0 10px', opacity: '.4' }}> x </Button>
          <DateRangeInput
            allowSingleDayRange={true}
            formatDate={date => date.toLocaleString()}
            onChange={(e) => {
              dispatch({ dateRange: e })
            }}
            parseDate={str => new Date(str)}
            value={state.dateRange}
            maxDate={new Date()}
            startInputProps={{ large: true, leftIcon: 'time' }}
            endInputProps={{ large: true, leftIcon: 'time' }}
          />

          {/*  status */}
          <Button
            large={true}
            minimal={true}
            icon={'reset'}
            style={{ margin: '0 10px', opacity: '.4' }}
            onClick={() => {
              dispatch({ dateRange: [null, null] })
            }}
          />

          <Button
            large={true}
            outlined={true}
            style={{ marginLeft: 0, opacity: '.8', flex: 1 }}
          >
            Total 83
          </Button>
        </div>

        <div className="r">
          <ControlGroup fill={true} vertical={false}>
            <InputGroup
              value={state.q}
              large={true}
              leftIcon={'search'}
              placeholder="Search title ..."
              autoFocus={true}
              onChange={(e) => {
                const value = e.target.value?.trim()
                dispatch({ q: value })
              }}
            />
          </ControlGroup>
        </div>
      </section>

      {/* tables */}
      <Card>
        {JSON.stringify(state, null, 2)}
      </Card>
    </main>
  )
}
import React, { Reducer, useEffect, useReducer, useState } from 'react'
import { Button, Callout, Card, ControlGroup, InputGroup, Spinner } from '@blueprintjs/core'
import { DateRangeInput } from '@blueprintjs/datetime'
import useRequest from '@ahooksjs/use-request'
import { Cell, Column, Table2 } from '@blueprintjs/table'
import Fuse from 'fuse.js'

type appState = {
  q: string | undefined
  category: 'all' | 'themes' | 'plugins' | string
  dateRange: [Date | null, Date | null]
  darkMode: boolean
  cacheKey: number
}

const sourceEndpoint = 'https://cdn.jsdelivr.net/gh/logseq/marketplace@master/plugins.json'

enum appActionsType {
  update = 'update'
}

const initialState: appState = {
  q: '',
  category: 'all',
  dateRange: [null, null],
  darkMode: true,
  cacheKey: 0
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

const fetchPlugins = () => {
  return fetch(sourceEndpoint)
    .then(r => r.json())
}

export function App () {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const { loading, data, error, run } = useRequest(fetchPlugins, {
    cacheKey: 'plugins-' + state.cacheKey,
    staleTime: 1000 * 60 * 10
  })

  const [results, setResults] = useState([])

  useEffect(() => {
    let ret = data?.packages || []

    // filters
    if (state.category?.toLowerCase() !== 'all') {
      const shouldTheme = state.category.toLowerCase() === 'themes'
      ret = ret.filter((it: any) => {
        return shouldTheme ? it.theme : !it.theme
      })
    }

    const startTime = state.dateRange[0]?.getTime()
    const endTime = state.dateRange[1]?.getTime()

    if (startTime && endTime) {
      ret = ret.filter((it: any) => {
        if (!it.addedAt) return true

        return it.addedAt >= startTime && it.addedAt <= endTime
      })
    }

    // search
    if (ret?.length > 1 && state.q?.trim().length > 1) {
      const s = new Fuse(ret, {
        includeScore: false,
        distance: 10,
        minMatchCharLength: 2,
        keys: ['title', 'name']
      })
      ret = s.search(state.q)
      ret = ret?.map((it: any) => it.item)
    }

    // sort
    ret = ret.sort((a: any, b: any) => {
      if (!b.addedAt) return
      return b.addedAt - a.addedAt
    })

    setResults(ret)
  }, [
    data, state.q,
    state.dateRange,
    state.category
  ])

  useEffect(() => {
    const body = document.body
    if (state.darkMode) {
      body.classList.add('bp4-dark')
    } else {
      body.classList.remove('bp4-dark')
    }
  }, [state.darkMode])

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
                return <option value={it.toLowerCase()}>{it}</option>
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
            formatDate={date => date.toDateString()}
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
            className={'reset-date-range'}
            large={true}
            minimal={true}
            icon={'reset'}
            onClick={() => {
              dispatch({ dateRange: [null, null] })
            }}
          />

          <Button
            large={true}
            outlined={true}
            style={{ marginLeft: 0, opacity: '.8', flex: 1 }}
            onClick={() => {
              dispatch({ cacheKey: Date.now() })
              // refresh()
              run()
            }}
          >
            Total {results?.length || 0}
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
                const value = e.target.value
                dispatch({ q: value })
              }}
            />
          </ControlGroup>
        </div>
      </section>

      {error ? <Callout title={'Remote Error'} intent={'danger'}>{error.toString()}</Callout> :
        (<div className={'table-wrap'}>
          {(loading ? <Spinner/> : <PluginsTable plugins={results}/>)}
        </div>)
      }
    </main>
  )
}

function PluginsTable (props: { plugins: Array<any> }) {
  const { plugins } = props

  const titleCellRenderer = (rowIndex: number) => {
    const d = plugins[rowIndex]
    return (
      <Cell>
        {d.theme ? '🎨' : '🧩'} {d.title}
      </Cell>
    )
  }

  const authorCellRenderer = (rowIndex: number) => <Cell>{plugins[rowIndex].author}</Cell>
  const descCellRenderer = (rowIndex: number) => <Cell>{plugins[rowIndex].description}</Cell>
  const repoCellRenderer = (rowIndex: number) => {
    const d = plugins[rowIndex]
    return (
      <Cell>
        <a href={'https://github.com/' + d.repo} target={'_blank'}>
          {d.repo}
        </a>
      </Cell>
    )
  }

  const addedAtCellRenderer = (rowIndex: number) => {
    const d = plugins[rowIndex].addedAt
    const date = new Date(d).toDateString()
    return <Cell>{date}</Cell>
  }

  return (
    <Table2 numRows={plugins.length} columnWidths={[250, 150, 300, 160, 300]}>
      <Column name={'Title'} cellRenderer={titleCellRenderer}/>
      <Column name={'Author'} cellRenderer={authorCellRenderer}/>
      <Column name={'Repo'} cellRenderer={repoCellRenderer}/>
      <Column name={'Added at'} cellRenderer={addedAtCellRenderer}/>
      <Column name={'Description'} cellRenderer={descCellRenderer}/>
    </Table2>
  )
}
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getResults } from '../../api'

const LIMITS = ['6', '12', '18', '24', '30']

const SearchForm = ({ query, limit, onQueryChange, onLimitChange }) => (
  <div style={{ maxWidth: 400, margin: '20px auto' }}>
    <input
      type="search"
      placeholder="Search Giphy"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
    />
    <label>
      # of Results
      <select onChange={(e) => onLimitChange(e.target.value)} value={limit}>
        {LIMITS.map((limit) => (
          <option key={limit} value={limit}>
            {limit}
          </option>
        ))}
      </select>
    </label>
  </div>
)

const Results = ({ results }) => {
  if (results.length === 0) {
    return null
  }

  return (
    <section>
      {results.map((item) => (
        <section
          key={item.id}
          className="card"
          style={{
            width: '300px',
            display: 'inline-block',
            marginRight: '16px',
          }}
        >
          <video src={item.previewUrl} alt={item.title} loop autoPlay />
          <section className="card-section">
            <h5>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>{' '}
              ({item.rating})
            </h5>
          </section>
        </section>
      ))}
    </section>
  )
}

const App = ({ initialQuery, initialLimit, pollInterval }) => {
  const [query, setQuery] = useState(initialQuery)
  const [limit, setLimit] = useState(initialLimit)
  const [results, setResults] = useState([])

  useEffect(() => {
    const fetchResults = () => {
      getResults({ query, limit }).then(
        (apiResults) => setResults(apiResults),
        (err) => {
          console.error(err)
        },
      )
    }

    const intervalId = setInterval(fetchResults, pollInterval * 1000)

    fetchResults()

    return () => {
      clearInterval(intervalId)
    }
  }, [query, limit, pollInterval])

  return (
    <main>
      <h1>Giphy Search!</h1>

      <SearchForm
        query={query}
        limit={limit}
        onQueryChange={setQuery}
        onLimitChange={setLimit}
      />

      <Results results={results} />
    </main>
  )
}
App.propTypes = {
  initialQuery: PropTypes.string,
  initialLimit: PropTypes.string,
  pollInterval: PropTypes.number,
}
App.defaultProps = {
  initialQuery: '',
  initialLimit: '12',
  pollInterval: 30,
}

export default App

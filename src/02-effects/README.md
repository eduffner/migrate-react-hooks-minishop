# Step 2 - Effects

Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of _side effects_. They are not part of the main render loop of a component, but a very common in React components.

🏅 The goal of this step is to learn how to use the `useEffect` hook in a function component to replace the `componentDidMount`, `componentDidUpdate` & `componentWillUnmount` lifecycle methods from class components.

<details>
  <summary><b>Help! I didn't finish the previous step! 🚨</b></summary>

If you didn't successfully complete the previous step, that's okay! The steps are meant to push you. 😄

However, you may find yourself in a position where you app is not compiling because of TypeScript errors, and it's preventing you from working on the next step. No problem! Stash your changes **in a new terminal window**, and you should be good to continue:

```sh
git stash push -m "In-progress Step 1 exercises"
```

Your app should automatically reset and you should be able to continue on with the current step.

</details>

## 🐇 Jump Around

[Concepts](#-concepts) | [Learn](#-learn) | [Exercises](#-exercises) | [Elaboration & Feedback](#-elaboration--feedback) | [Resources](#-resources)

## ⭐ Concepts

- Handling effects without cleanup
- Handling effects with cleanup
- Optimizing performance by skipping redundant effects

## 📝 Learn

If we extend our `<Counter />` component from [Step 1](../01-state/) to store the current counter to `localStorage` and load the initial counter value from `localStorage`, we're now performing a side effect. With class components this would look like:

```js
const getRandomCount = () => Math.ceil(Math.random() * 10)

class Counter extends Component {
  static propTypes = {
    label: PropTypes.string,
  }
  static defaultProps = {
    label: 'Count',
  }

  constructor(props) {
    super(props)

    this.state = {
      count:
        Number.parseInt(window.localStorage.getItem('count')) ||
        getRandomCount(),
    }
  }

  componentDidMount() {
    window.localStorage.setItem('count', this.state.count)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.count !== prevState.count) {
      window.localStorage.setItem('count', this.state.count)
    }
  }

  render() {
    return (
      <div>
        <p>
          {this.props.label}: {this.state.count}
        </p>
        <div>
          <button
            type="button"
            className="button"
            onClick={() =>
              this.setState((prevState) => ({ count: prevState.count - 1 }))
            }
          >
            -
          </button>
          <button
            type="button"
            className="button"
            onClick={() =>
              this.setState((prevState) => ({ count: prevState.count + 1 }))
            }
          >
            +
          </button>
        </div>
      </div>
    )
  }
}
```

The tricky bit is the `componentDidUpdate`. We need to update `localStorage` whenever `this.state.count` changes, but we don't want to _unnecessarily_ update it if other props (or other state) changes.

The equivalent function component with the `useEffect` hook looks like:

```js
const getRandomCount = () => Math.ceil(Math.random() * 10)

const Counter = ({ label }) => {
  const [count, setCount] = useState(
    () =>
      Number.parseInt(window.localStorage.getItem('count')) || getRandomCount(),
  )

  useEffect(() => {
    window.localStorage.setItem('count', count)
  }, [count])

  return (
    <div>
      <p>
        {label}: {count}
      </p>
      <div>
        <button
          type="button"
          className="button"
          onClick={() => setCount((prevCount) => prevCount - 1)}
        >
          -
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setCount((prevCount) => prevCount + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
Counter.propTypes = {
  label: PropTypes.string,
}
Counter.defaultProps = {
  label: 'Count',
}
```

`useEffect` by default handles both the initial `localStorage` update (`componentDidMount`) as well as the follow-up updates (`componentDidUpdate`). And the dependency array handles the performance optimization of only updating when `count` changes. Use the React Developer Tools to change the `label` prop and verify that the `localStorage` update doesn't happen unnecessarily.

In component classes, when side effect cleanup is necessary, we use `componentWillUnmount`:

```js
class Clock extends Component {
  static propTypes = {
    tickAmount: PropTypes.number,
  }
  static defaultProps = {
    tickAmount: 1000,
  }

  constructor(props) {
    super(props)

    this.state = {
      time: new Date(),
    }
  }

  setup() {
    this.intervalId = setInterval(() => {
      this.setState({ time: new Date() })
    }, this.props.tickAmount)
  }

  cleanup() {
    clearInterval(this.intervalId)
  }

  componentDidMount() {
    this.setup()
  }

  componentDidUpdate(prevProps) {
    if (this.props.tickAmount !== prevProps.tickAmount) {
      this.cleanup()
      this.setup()
    }
  }

  componentWillUnmount() {
    this.cleanup()
  }

  render() {
    return (
      <div>
        <p>The time is {this.state.time.toLocaleTimeString()}.</p>
      </div>
    )
  }
}
```

Again the `componentDidUpdate` ends up being the tricky bit because when the `tickAmount` prop; changes, we have to cancel the current interval, and start a new interval with the new `tickAmount` value.

The equivalent hooks implementation looks like:

```js
const ClockHooks = ({ tickAmount }) => {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date())
    }, tickAmount)

    return () => {
      clearInterval(intervalId)
    }
  }, [tickAmount])

  return (
    <div>
      <p>The time is {time.toLocaleTimeString()}.</p>
    </div>
  )
}
ClockHooks.propTypes = {
  tickAmount: PropTypes.number,
}
ClockHooks.defaultProps = {
  tickAmount: 1000,
}
```

The function returned by `useEffect` is the cleanup function. And by setting `tickAmount` in the dependencies, `useEffect` will automatically cleanup and setup with the new `tickAmount` value whenever it changes. Use the React Developer Tools to change the `tickAmount` prop to see the tick speed adjusting.

## 💡 Exercises

In [`App.js`](./App.js), convert the `App` class component into a function component using the `useEffect` hook.

## 🤓 Bonus!

### 1. Polling

Add polling to the app such that it will continually retrieve new results after a configurable amount of seconds. Add a `pollInterval` prop to `App` and have it default to 30 seconds. Verify that if you change `pollInterval` in the React Developer Tools the previous interval is cleaned up and a new one is created.

### 2. Async `useEffect`

Use an `async` function for the call to `getResults()` within `useEffect()` instead of calling `.then()` on its return value.

🔑 _HINT:_ Remember that an `async` function **always** returns a `Promise`, but the only return value allowed for `useEffect()` is the cleanup function callback.

## 🧠 Elaboration & Feedback

After you're done with the exercise and before jumping to the next step, please fill out the [elaboration & feedback form](https://docs.google.com/forms/d/e/1FAIpQLScRocWvtbrl4XmT5_NRiE8bSK3CMZil-ZQByBAt8lpsurcRmw/viewform?usp=pp_url&entry.1671251225=Migrating+to+React+Hooks+Minishop&entry.1984987236=Step+2+-+Effects). It will help seal in what you've learned.

## 📕 Resources

- [Using the Effect Hook](https://reactjs.org/docs/hooks-effect.html)
- [`useEffect` API Reference](https://reactjs.org/docs/hooks-reference.html#useeffect)
- [React Hooks](https://www.youtube.com/watch?v=jd8R0a2Ur8Q) 📺
- [Introducing Hooks](https://www.youtube.com/watch?v=dpw9EHDh2bM) 📺
- [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [State and Lifecycle](https://reactjs.org/docs/state-and-lifecycle.html)

## ❓ Questions

Got questions after the minishop? Need further clarification? Feel free to post a question in [Ben Ilegbodu's AMA](https://www.benmvp.com/ama/)!

## 👉🏾 Next Step

Go to [Step 3 - Context & Ref](../03-context-ref/).
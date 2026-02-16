import { useState } from "react";
import ViteImges from "./viteImges";
import Head from "./head";
import "./App.css";

function App() {
  const [count, setCount] = useState(5);

  const [isName, setIsName] = useState("");

  function handleChange(e) {
    setIsName("subomi");
  }

  console.log(isName);
  return (
    <>
      <ViteImges />
      <Head />

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <p
        onClick={() => {
          handleChange();
        }}
      >
        name is {isName}
      </p>
    </>
  );
}

export default App;

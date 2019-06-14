import React from "react";
import ReactDOM from "react-dom";
import Example from "./Example";

const App = () => {
  return (
    <div>
      <Example name="Hi" age="11" />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

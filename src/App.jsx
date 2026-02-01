import "./App.css";
import { Fragment } from "react";

const poem = {
  lines: [
    "I write, erase, rewrite",
    "Erase again, and then",
    "A poppy blooms.",
  ],
};

let id = 2;

export default function Poem() {
  let result = [];
  for (const line of poem.lines) {
    result.push(<p>{line + ", id is:" + id}</p>);
    id++;
  }
  return <div>{result}</div>;
}

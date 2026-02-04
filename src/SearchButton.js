import { useContext } from "react";
import { SearchInputContext } from "./App.jsx";
export default function SearchButton() {
  const setSearchTerm = useContext(SearchInputContext);
  const onClick = () => {
    setSearchTerm();
  };
  return (
    <button onClick={onClick}>
      搜索
    </button>
  );
}

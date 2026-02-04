import { useRef } from "react";
import { useContext } from "react";
import { SearchInputContext } from "./App.jsx";

export default function SearchInput() {
    const inputRef = useRef(null);
    let setSearchTerm = useContext(SearchInputContext);
    setSearchTerm = () => {
        inputRef.current.focus();
        console.log("搜索内容：", inputRef.current.value);
    }
    return (
        <input
            ref={inputRef}
            placeholder="找什么呢？"
        />
    );
}

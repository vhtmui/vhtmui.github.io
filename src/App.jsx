import SearchButton from './SearchButton.js';
import SearchInput from './SearchInput.js';
import { createContext } from 'react';

export let SearchInputContext = createContext(() => { });

export default function Page() {
  return (
    <SearchInputContext.Provider value={() => {}}>
      <nav>
        <SearchButton/>
      </nav>
      <SearchInput />
    </SearchInputContext.Provider>
  );
}

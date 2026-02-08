import ModeToggle from "./ModeToggle";
import Nav from "./Nav";
export default function Header() {
    return (
        <header className="h-14 flex flex-row items-center pr-4 pl-4 sticky top-0 z-10 backdrop-blur-sm border-b">
            <Nav />
            <ModeToggle />
        </header>
    );
}
import { Link, Outlet } from 'react-router'

function App() {
  return (
    <>
      <Link to='/home'>Home</Link>
      <Outlet />
    </>
  )
}

export default App

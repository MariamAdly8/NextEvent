import NavBar from '../components/NavBar/NavBar'
import Footer from '../components/Footer/Footer'
import { Outlet } from 'react-router-dom'

export default function SharedLayout() {
  return (
    <div>
      <NavBar/>
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}

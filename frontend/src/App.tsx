

import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Receiver } from './Receiver'
import Sender from './Sender'
function App() {
 

  return (
   <Routes>

    <Route path='/sender' element={<Sender/>}/>
    <Route path='/receiver' element={<Receiver/>}/> 
   

   </Routes>
  )
}

export default App

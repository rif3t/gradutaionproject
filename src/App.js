// ملف App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from "react-router-dom";
import Loginpage from './login';
import BasicExample from './dashboard';
import Instracpage from './instractour';
import Layout from './layout';

function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Loginpage></Loginpage>} />
      <Route element={<Layout/>}>
      <Route path='/dashboard' element={<BasicExample></BasicExample>} />
      <Route path='/Instracpage' element={<Instracpage/>}/>
      </Route>

    </Routes>
    </>
  );
}

export default App;
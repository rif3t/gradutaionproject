import { Outlet } from "react-router-dom";
import Navbarr from "./navbar";
import Navbarr2 from "./navbar2";
function Layout(){
    return(
<>
<div style={{ display: "flex" }}>
      <Navbarr />
      <Navbarr2/>
        <Outlet /> 
    </div>

</>
    );
}
export default Layout;
// src/components/Header.jsx
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
   const {user , logout} = useUser();
    const navigate = useNavigate();

    useEffect(()=>{
         if(!user) navigate("/login")
       },[user])
   
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Book System</h1>
        <ul className="flex space-x-4">
          {user ?
          <>
          <li><Link to="/Home" className="hover:underline">Home</Link></li>
          <li><Link to="/Books" className="hover:underline">Books</Link></li>
          <li><Link to="/Booked" className="hover:underline">Booked</Link></li>
         

         
          <button className="hover:underline" onClick={() => logout()}>Logout</button>
          </>

          :
          <>
          
          <li><Link to="/login" className="hover:underline">Login</Link></li>
           <li><Link to="/Register" className="hover:underline">Register</Link></li>

          </>
}
        </ul>
          
      </div>
    </nav>
  );
};

export default Sidebar;

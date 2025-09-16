import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";


const Login = () => {

    const [form , setForm] = useState({
        email: "",
        password: ""
    });
    const {login, user} = useUser();
    useEffect(()=>{
      if(user) navigate("/")
    },[user])
   
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        
        setForm({
            ...form,
            [event.target.id]: event.target.value
        });
        
    }
    const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
        const {data} = await axios.post('/api/user/loginuser', form);
        console.log(data); 
        toast.success("Login successful!");
        setLoading(false);
        login(data, data.expirein)
        navigate("/"); // Redirect to home page after successful login



    } catch (error) {
        setLoading(false);
        toast.error(error.response.data);
        console.error(error);
        
    }
    }
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm animate-fade-in"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
           Login Page
        </h2>
        <div className="mb-4">
         
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-600">Email</label>
          <input
            type="text"
            placeholder="email"
           
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-600">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            id="password"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition-all duration-300"
        >
            {loading ? "Loading..." : "Login"}
        </button>
         <p className="mt-4 text-center text-sm text-gray-600">
           Create New Account?{" "}
           <Link to="/Register" className="text-blue-500 hover:underline">Register</Link>
         
        </p>
      </form>
    </div>
  );
}
export default Login;
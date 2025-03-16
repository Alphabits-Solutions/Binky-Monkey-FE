import {useState} from "react";
import Signup from "../components/auth/signup";
import Login from "../components/auth/login";
import monkey from "../assets/icons/monkey.svg";
import "../assets/sass/auth.scss";

export default function Auth() {

  const [signup,setSignup] = useState(false);

  return (
    <div className="auth-container">
      <div className="flex-divider">
        <div className="icon-div">
          <img src={monkey} alt="" />
        </div>
        <div className="form-compo">
          {signup?<Signup setSignup={setSignup}/>:<Login setSignup={setSignup}/>}
        </div>
      </div>
    </div>
  );
}

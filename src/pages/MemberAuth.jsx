import { useState } from "react";
import RegisterMember from "../components/authOnboarding/registerMember";
import LoginMember from "../components/authOnboarding/loginMember";
import monkey from "../assets/icons/monkey.svg";
import "../assets/sass/auth.scss";

export default function MemberAuth() {
  const [registerMember, setRegisterMember] = useState(false);

  return (
    <div className="auth-container">
      <div className="flex-divider">
        <div className="icon-div">
          <img src={monkey} alt="Monkey Icon" />
        </div>
        <div className="form-compo">
          {registerMember ? <RegisterMember setRegisterMember={setRegisterMember} /> : <LoginMember setRegisterMember={setRegisterMember} />}
        </div>
      </div>
    </div>
  );
}

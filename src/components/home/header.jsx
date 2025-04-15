import React from "react";
import { Layout } from "antd";
import ProfileDropdown from "../home/profileDropdown";
import { Link } from "react-router-dom";



const { Header } = Layout;

const Navbar = () => {
  return (
    <Header className="header">
      <div className="logo">
        <Link to="/">
          <img src="src\assets\icons\headerlogo.svg" alt="Binky Monkey" />
        </Link>
      </div>
      <ProfileDropdown />
    </Header>
  );
};

export default Navbar;

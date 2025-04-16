import { Layout } from "antd";
import ProfileDropdown from "../home/profileDropdown";
import { Link } from "react-router-dom";
import HeaderLogo from "../../assets/icons/headerlogo.svg";



const { Header } = Layout;

const Navbar = () => {
  return (
    <Header className="header">
      <div className="logo">
        <Link to="/">
        
          <img src={HeaderLogo} alt="Binky Monkey" />
        </Link>
      </div>
      <ProfileDropdown />
    </Header>
  );
};

export default Navbar;

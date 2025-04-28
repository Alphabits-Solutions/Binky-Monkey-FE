import { Layout, Avatar, Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import HeaderLogo from "../assets/icons/headerlogo.svg";
import User from "../assets/icons/user.svg";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("x-auth-token");
    navigate("/auth");
  };

  const dropdownItems = [
    {
      key: "1",
      label: <span onClick={handleLogout}>Logout</span>,
    },
    {
      type: "divider",
    },
  ];

  return (
    <AntHeader className="header">
      <div className="logo">
        <Link to="/">
          <img src={HeaderLogo} alt="Binky Monkey" />
        </Link>
      </div>
      <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <Avatar
              className="avatar"
              src={User}
              style={{ cursor: "pointer" }}
            />
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
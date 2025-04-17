import { DownOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import User from "../../assets/icons/user.svg";

const UserDropdown = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("x-auth-token");
    navigate("/auth");
  };

  const items = [
    {
      key: '1',
      label: (
        <span onClick={handleLogout}>
          Logout
        </span>
      ),
    },
    {
      type: 'divider',
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
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
  );
};

export default UserDropdown;

import React from 'react';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Space} from 'antd';
const items = [
  {
    key: '1',
    label: 'My Account',
    disabled: true,
  },
  {
    type: 'divider',
  },
  {
    key: '2',
    label: 'Profile',
    extra: '⌘P',
  },
  {
    key: '3',
    label: 'Billing',
    extra: '⌘B',
  },
  {
    key: '4',
    label: 'Settings',
    icon: <SettingOutlined />,
    extra: '⌘S',
  },
];
const App = () => (
  <Dropdown menu={{ items }}>
    <a onClick={e => e.preventDefault()}>
    <Avatar
          src="https://randomuser.me/api/portraits/women/44.jpg"
          style={{ cursor: "pointer" }}
        />
        <Space>

        <DownOutlined />
      </Space>
    </a>
  </Dropdown>
  
 
);
export default App;
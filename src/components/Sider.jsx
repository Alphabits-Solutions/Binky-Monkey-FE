import React, { useContext } from "react";
import { Menu } from "antd";
import pagesIcon from "../assets/icons/Home/LeftSidebar/pages.svg";
import layerIcon from "../assets/icons/Home/LeftSidebar/layer.svg";
import assetIcon from "../assets/icons/Home/LeftSidebar/assets.svg";
import audioIcon from "../assets/icons/Home/LeftSidebar/audio.svg";
import objectIcon from "../assets/icons/Home/LeftSidebar/objects.svg";
import {AppContext} from "../context/AppContext";

const sidebarItems = [
  {
    key: "1",
    icon: pagesIcon,
    label: "Pages",
  },
  {
    key: "2",
    icon: layerIcon,
    label: "Layers",
  },
  {
    key: "3",
    icon: assetIcon,
    label: "Assets",
  },
  {
    key: "4",
    icon: audioIcon,
    label: "Audio",
  },
  {
    key: "5",
    icon: objectIcon,
    label: "Objects",
  },
];

const Sider = () => {
  const {setSelectedTab,selectedTab} = useContext(AppContext);

  const handleMenuClick = ({ key }) => {
    setSelectedTab(key);
  };

  return (
    <div className="sider-container">
      <Menu
        className="sider-menu"
        theme="light"
        mode="vertical"
        selectedKeys={[selectedTab]}
        onClick={handleMenuClick}
      >
        {sidebarItems.map((item) => (
          <Menu.Item key={item.key} className="sider-menu-item">
            <img src={item.icon} alt={item.label} className="menu-icon" />
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default Sider;
/* eslint-disable react/prop-types */
import React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const SidebarMenu = ({ sidebarItems, selectedKey }) => (
  <Menu
    className="menu"
    theme="light"
    mode="vertical"
    selectedKeys={[selectedKey]}
  >
    {sidebarItems.map((item) => (
      <Menu.Item key={item.key} className="menuItem">
        <Link to={item.path} aria-label={item.label}>
          <img src={item.icon} alt={item.label} />
        </Link>
      </Menu.Item>
    ))}
  </Menu>
);

export default SidebarMenu;
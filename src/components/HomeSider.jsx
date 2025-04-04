import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import pages from "../assets/icons/Home/LeftSidebar/pages.svg";
import layer from "../assets/icons/Home/LeftSidebar/layer.svg";
import asset from "../assets/icons/Home/LeftSidebar/assets.svg";
import audio from "../assets/icons/Home/LeftSidebar/audio.svg";
import object from "../assets/icons/Home/LeftSidebar/objects.svg";
import more from "../assets/icons/Home/LeftSidebar/more.svg";

const { Sider } = Layout;

const HomeSider = () => {
  const location = useLocation();

  return (
    <Sider width={100} className="sidebar">
      <Menu className="menu" theme="light" mode="vertical" selectedKeys={[location.pathname]}>
        <Menu.Item key="/pages" className="menuItem">
          <Link to="/pages">
            <img src={pages} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/layer" className="menuItem">
          <Link to="/layer">
            <img src={layer} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/asset" className="menuItem">
          <Link to="/asset">
            <img src={asset} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/audio" className="menuItem">
          <Link to="/audio">
            <img src={audio} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/object" className="menuItem">
          <Link to="/object">
            <img src={object} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/more" className="menuItem">
          <Link to="/more">
            <img src={more} alt="" />
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default HomeSider;

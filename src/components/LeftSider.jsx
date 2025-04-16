import { Layout, Menu } from "antd";
import { Link, useLocation, useParams } from "react-router-dom";
import pages from "../assets/icons/Home/LeftSidebar/pages.svg";
import layer from "../assets/icons/Home/LeftSidebar/layer.svg";
import asset from "../assets/icons/Home/LeftSidebar/assets.svg";
import audio from "../assets/icons/Home/LeftSidebar/audio.svg";
import object from "../assets/icons/Home/LeftSidebar/objects.svg";
import more from "../assets/icons/Home/LeftSidebar/more.svg";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const { Sider } = Layout;

const HomeSider = () => {
  const { selectedPage } = useContext(AppContext);
  const { activityId } = useParams();
  const { pageId } = useParams();

  const location = useLocation();

  

  return (
    <Sider width={100} className="sidebar">
      <Menu className="menu" theme="light" mode="vertical" selectedKeys={[location.pathname]}>
        <Menu.Item key="/page" className="menuItem">
          <Link to={`/activity/${activityId}/page`}>
            <img src={pages} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/layer"disabled={!selectedPage} className="menuItem">
          <Link to={`/activity/${activityId}/page/${pageId}/layer`}>
            <img src={layer} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/asset" className="menuItem">
          <Link to={`/activity/${activityId}/asset`}>
            <img src={asset} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/audio" className="menuItem">
          <Link to={`/activity/${activityId}/audio`}>
            <img src={audio} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/object" className="menuItem">
          <Link to={`/activity/${activityId}/object`}>
            <img src={object} alt="" />
          </Link>
        </Menu.Item>
        <Menu.Item key="/more" className="menuItem">
          <Link to={`/activity/${activityId}/more`}>
            <img src={more} alt="" />
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default HomeSider;

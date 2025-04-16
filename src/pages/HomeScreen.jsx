import { Layout, Menu } from "antd";

import pages from "../assets/icons/Home/LeftSidebar/pages.svg";
import layer from "../assets/icons/Home/LeftSidebar/layer.svg";
import asset from "../assets/icons/Home/LeftSidebar/assets.svg";
import audio from "../assets/icons/Home/LeftSidebar/audio.svg";
import object from "../assets/icons/Home/LeftSidebar/objects.svg";
import more from "../assets/icons/Home/LeftSidebar/more.svg";

import "../assets/sass/homescreen.scss";

import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import Navbar from "../components/home/header";
import ActivitySection from "../components/home/ActivitySection";

const { Header, Content, Sider } = Layout;

const HomeScreen = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { activityId } = useParams();

  const isDisabled = !activityId;

  const handleDisabledClick = () => {
    alert("Please select an activity first");
  };

  const sidebarItems = [
    { key: "pages", icon: pages },
    { key: "layer", icon: layer },
    { key: "asset", icon: asset },
    { key: "audio", icon: audio },
    { key: "object", icon: object },
    { key: "more", icon: more },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header">
        <Navbar />
      </Header>

      <Layout className="main-content">
        
          <Sider width={100} className="sidebar">
            <Menu
              className="menu"
              theme="light"
              mode="vertical"
              selectedKeys={[location.pathname]}
            >
               {sidebarItems.map((item) => (
              <Menu.Item key={item.key} className="menuItem">
                {isDisabled ? (
                  <div
                    onClick={handleDisabledClick}
                    style={{ cursor: "not-allowed", opacity: 0.5 }}
                  >
                    <img src={item.icon} alt={item.key} />
                  </div>
                ) : (
                  <Link to={`/activity/${activityId}/${item.key}`}>
                    <img src={item.icon} alt={item.key} />
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

      

        <Content className="content">
          {isHomePage && <ActivitySection />}

          {!isHomePage && !activityId && (
            <div className="no-activity-selected">
              <h2>Please select an activity to proceed</h2>
            </div>
          )}

          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeScreen;

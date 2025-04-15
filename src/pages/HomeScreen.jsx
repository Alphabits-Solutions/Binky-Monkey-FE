import { Layout, Menu, Button, Card} from "antd";

import pages from "../assets/icons/Home/LeftSidebar/pages.svg";
import layer from "../assets/icons/Home/LeftSidebar/layer.svg";
import asset from "../assets/icons/Home/LeftSidebar/assets.svg";
import audio from "../assets/icons/Home/LeftSidebar/audio.svg";
import object from "../assets/icons/Home/LeftSidebar/objects.svg";
import more from "../assets/icons/Home/LeftSidebar/more.svg";
import folder from "../assets/icons/folder.svg";
import "../assets/sass/homescreen.scss";

import { Outlet, useLocation,Link } from "react-router-dom";
import Navbar from "../components/home/header";


const { Header, Content, Sider } = Layout;

const activities = [
  "Activity A",
  "Activity B",
  "Activity C",
  "Activity D",
  "Activity E",
  "Activity F",
  "Activity G",
];

const HomeScreen = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
        <Header className="header" >

        <Navbar />
        </Header>

    
      <Layout className="main-content">
      
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

      <Content className="content">
          {isHomePage && (
            <>
              <div className="content-header">
                <h2 className="title">Activity file</h2>
                <Link to="/create">
                  <Button type="color" className="create-btn">Create New Activity</Button>
                </Link>
              </div>

              {/* Activity Grid */}
              <div className="activity-grid">
                {activities.map((activity, index) => (
                  <Card key={index} className="activity-card">
                    <img src={folder} alt="" />
                    <p>{activity}</p>
                  </Card>
                ))}
                </div>
              {/* Activity Grid */}
              <div className="activity-grid">
                {activities.map((activity, index) => (
                  <Card key={index} className="activity-card">
                    <img src={folder} alt="" />
                    <p>{activity}</p>
                  </Card>
                ))}
              </div>
            </>
          )}

          
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeScreen;

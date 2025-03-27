import { Layout, Menu, Button, Card} from "antd";

import pages from "../assets/icons/pages.svg";
import layer from "../assets/icons/layer.svg";
import assets from "../assets/icons/assets.svg";
import audio from "../assets/icons/audio.svg";
import objects from "../assets/icons/objects.svg";
import more from "../assets/icons/more.svg";
import folder from "../assets/icons/folder.svg";
import "../assets/sass/homescreen.scss";
import { Link } from "react-router-dom";
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
  return (
    <Layout style={{ minHeight: "100vh" }}>
        <Header className="header" >

        <Navbar />

        </Header>

      {/* Main Content */}
      <Layout className="main-content">
      {/* Sidebar */}
      <Sider width={100} className="sidebar">
        
        <Menu className="menu" theme="light" mode="vertical" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" className="menuItem">
             <img src={pages} alt=""  />
          </Menu.Item>
          <Menu.Item key="2" className="menuItem">
          <img src={layer} alt="" />
          </Menu.Item>
          <Menu.Item key="3" className="menuItem">
          <img src={assets} alt="" />
          </Menu.Item>
          <Menu.Item key="4" className="menuItem">
          <img src={audio} alt="" />
          </Menu.Item>
          <Menu.Item key="5" className="menuItem">
          <img src={objects} alt="" />
          </Menu.Item>
          <Menu.Item key="6" className="menuItem">
          <img src={more} alt="" />
          </Menu.Item>
        </Menu>
      </Sider>

        <Content className="content">
          <div className="content-header">
            <h2 className="title">Activity file</h2>
            <Link to="/create">
            <Button type="color" className="create-btn">
            Create New Activity
            </Button>
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeScreen;

import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/HomeSider";
import RightSidebar from "../components/RightSidebar";
import Navbar from "../components/home/header";
import "../assets/sass/homescreen.scss";

const { Header, Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header">
        <Navbar />
      </Header>

      <Layout className="main-content">
        <Sidebar />
        <RightSidebar />
        <Content className="content">
          <div className="asset-manager">
            <div className="title-container">
              <div className="maintitle">Roger Center</div>
              <div className="subtitle">Save</div>
            </div>
            <img
              src="src\assets\backgrounds\contentpage.svg"
              alt="Expand"
              width="980"
              height="780"
            />
          </div>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

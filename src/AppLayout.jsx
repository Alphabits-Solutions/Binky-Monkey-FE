import React, { useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "../src/components/home/header";
import { AppContext } from "../src/context/AppContext";
import { getSidebarItems } from "../src/sidebarItems";
import SidebarMenu from "../src/SidebarMenu";
import MainRoutes from "../src/MainRoutes";

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
  const location = useLocation();
  const { activityId, pageId } = useParams();
  const { selectedPage, selectedActivity } = useContext(AppContext);
  const isHomePage = location.pathname === "/";

  const sidebarItems = getSidebarItems(
    selectedActivity || activityId || "",
    selectedPage || pageId || "1",
    pageId
  );

  const getSelectedKey = () => {
    const path = location.pathname;
    
    const matchedItem = sidebarItems.find((item) => {
      if (path === item.path) return true;
      if (path.startsWith(item.path)) return true;
      return false;
    });
    
    return matchedItem ? String(matchedItem.key) : "1";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header">
        <Navbar />
      </Header>
      <Layout className="main-content">
        {!isHomePage && (
          <Sider width={100} className="sidebar">
            <SidebarMenu 
              sidebarItems={sidebarItems} 
              selectedKey={getSelectedKey()} 
            />
          </Sider>
        )}
        <Content className="content">
          <MainRoutes />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
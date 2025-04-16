import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import ActivitySection from "./components/home/ActivitySection";
import HomeDashboard from "./pages/HomeDashboard";
import Pages from "./components/home/pages/pages";
import Layers from "./components/home/layer/layer";
import Asset from "./components/home/assets/assets";
import Audio from "./components/home/audio/Audio";
import Object from "./components/home/objects/objects";
import More from "./components/home/more/more";
import Navbar from "./components/home/header";
import { AppProvider, AppContext } from "./context/AppContext";
import { getSidebarItems } from "./sidebarItems";
import "./assets/sass/homescreen.scss";

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
  const location = useLocation();
  const { activityId, pageId } = useParams();
  const { selectedPage, selectedActivity } = React.useContext(AppContext);
  const isHomePage = location.pathname === "/";

  const sidebarItems = getSidebarItems(selectedActivity || activityId || "", selectedPage || pageId || "1", pageId);

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
            <Menu
              className="menu"
              theme="light"
              mode="vertical"
              selectedKeys={[getSelectedKey()]}
            >
              {sidebarItems.map((item) => (
                <Menu.Item key={item.key} className="menuItem">
                  <Link to={item.path} aria-label={item.label}>
                    <img src={item.icon} alt={item.label} />
                  </Link>
                </Menu.Item>
              ))}
            </Menu>
          </Sider>
        )}
        <Content className="content">
          <Routes>
            <Route path="/" element={<ActivitySection />} />
            <Route path="/activity/:activityId" element={<HomeDashboard />}>
              <Route path="page" element={<Pages />} />
              <Route path="layer" element={<Layers />} />
              <Route path="asset" element={<Asset />} />
              <Route path="audio" element={<Audio />} />
              <Route path="object" element={<Object />} />
              <Route path="more" element={<More />} />
            </Route>
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
};

export default App;
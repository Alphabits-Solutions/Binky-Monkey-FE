import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Layout, ConfigProvider, theme } from "antd";
import Auth from "./pages/Auth";
import Header from "./components/header";
import ActivitySection from "./pages/ActivitySection";
import Game from "./pages/Game";
import "./assets/sass/homescreen.scss";

const {  Content } = Layout;

const App = () => {
  const isHomePage = location.pathname === "/";

  return (
    <ConfigProvider
    theme={{
      // 1. Use dark algorithm
      // algorithm: theme.darkAlgorithm,

      // 2. Combine dark algorithm and compact algorithm
      algorithm:  theme.compactAlgorithm,
    }}
  >
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="*"
            element={
              <Layout style={{ minHeight: "100vh" }}>
                <Header/>
                <Layout className="main-content">
                  <Content className="content">
                    <Routes>
                      <Route path="/" element={<ActivitySection />} />
                      <Route path="/home" element={<Game />} />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            }
          />
        </Routes>
      </Router>
      </ConfigProvider>
  );
};

export default App;

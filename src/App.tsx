// App.tsx
import React from "react";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import client from "./graphql/client";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetails from "./components/EmployeeDetails";
import FloatingIcon from "./FloatingIcon";
import "./App.css";

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="container my-5">
          <header
            className="d-flex justify-content-center align-items-center mb-5"
            style={{ backgroundColor: "#f0f0f0", padding: "2rem" }}
          >
            <h3 className="text-center text-dark">
              <Link to={`/`} className="text-decoration-none text-dark">
                Blog post operations using react, vite, typescript, graphql,
                apollo, bootstrap
              </Link>
            </h3>
          </header>
          <Routes>
            <Route path="/" element={<EmployeeList />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </Routes>
        </div>
      </Router>
      <FloatingIcon />
    </ApolloProvider>
  );
};

export default App;

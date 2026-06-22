import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import Dashboard from "../features/dashboard/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <Dashboard /> }],
  },
]);

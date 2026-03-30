import ReactDOM from "react-dom/client";
import './index.css'
import App from './App.tsx'
import {createBrowserRouter} from "react-router";
import {RouterProvider} from "react-router/dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
    },
]);

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
    <RouterProvider router={router}/>,
);

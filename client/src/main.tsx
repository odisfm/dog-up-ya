import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import App from './App.tsx'
import Ladder from "./components/Ladder.tsx";
import Round from "./components/Round.tsx";
import RoundNoDetailsRedirect from "./components/redirects/RoundNoDetailsRedirect.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route index element={<Navigate to="/round" replace />} />
                    <Route path="ladder/:season?" element={<Ladder />} />
                    <Route path="round/:season/:roundNum" element={<Round />} />
                    <Route path="round/*" element={<RoundNoDetailsRedirect />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
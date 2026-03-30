import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import App from './App.tsx'
import Ladder from "./Ladder.tsx";
import Round from "./Round.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route index element={<Navigate to="/round" replace />} />
                    <Route path="ladder/:season?" element={<Ladder />} />
                    <Route path="round/:season?/:roundNum?" element={<Round />}></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
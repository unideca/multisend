import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Multi from "./components/Multi";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="multi" element={<Multi/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
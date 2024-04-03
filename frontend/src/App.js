import "./App.css";
import FeedFetcher from "./components/FeedFetcher";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="App">
      <FeedFetcher />
      <ToastContainer />
    </div>
  );
}

export default App;

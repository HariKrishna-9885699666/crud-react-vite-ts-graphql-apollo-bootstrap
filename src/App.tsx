import FloatingIcon from "./FloatingIcon";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <header
          className="d-flex justify-content-center align-items-center mb-5"
          style={{ backgroundColor: "#f0f0f0", padding: "2rem" }}
        >
          <h3 className="text-center text-dark">
            IP Information - React + Vite + Typescript + Bootstrap CSS
          </h3>
        </header>
      </div>
      <FloatingIcon />
    </>
  );
}

export default App;

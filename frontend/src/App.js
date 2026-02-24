import Home from "./Home";
import Navbar from "./components/Navbar";
import TestPayment from "./components/TestPayment";

function App() {
  return (
    <>
      <Navbar />
      <Home />
      <TestPayment orderId={4} /> {/* <--- Aquí agregamos el componente de prueba */}
    </>
  );
}

export default App;
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Navigation from "./Navigation";
import { loadProvider, loadChainId } from '../store/interactions'

function App() {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    const provider = await loadProvider(dispatch)

    await loadChainId(provider, dispatch)


    setIsLoading(false)
  }

  useEffect(() => {
    if(isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  return (
    <Container>
      <Navigation />

      <hr />


    </Container>
  );
}

export default App;

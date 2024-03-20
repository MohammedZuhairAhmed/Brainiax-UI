import { Provider } from "react-redux";

import { ErrorBoundary } from "./app/screens/ErrorScreen/ErrorBoundary";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Import SafeAreaProvider

import Main from "./app/screens/Main";
import { store } from "./app/store";

export default function App() {
  return (
    <SafeAreaProvider>
    <Provider store={store}>
      <ErrorBoundary catchErrors="always">
        <Main />
      </ErrorBoundary>
    </Provider>
    </SafeAreaProvider>
  );
}

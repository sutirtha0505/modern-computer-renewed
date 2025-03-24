// hooks/ReduxProvider.tsx
"use client"
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";

const persistor = persistStore(store);

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>

      {children}
        </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;

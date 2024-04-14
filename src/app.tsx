import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Router
      root={props => (
        <Suspense fallback={
          <Layout>
            <span class="m-auto loading loading-spinner text-primary loading-lg" />
          </Layout>
        }>
          {props.children}
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
